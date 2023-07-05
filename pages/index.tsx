import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { NextPage } from "next"
import axios from "axios"

const LOCAL_STORAGE_KEY_API_KEY = "OPENAI_API_KEY" as const

type ImageGenerationResponse = {
  object: "edit"
  created: number
  choices: {
    text: string
    index: number
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const IndexPage: NextPage = () => {
  const [apiKey, setApiKey] = useState<string>()
  const [body, setBody] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [response, setResponse] = useState<ImageGenerationResponse>()
  useEffect(() => {
    const storageApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY)
    if (storageApiKey) setApiKey(storageApiKey)
  }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("変換中めう...")
    setResponse(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const { data } = await axios.post<ImageGenerationResponse>(
        "https://api.openai.com/v1/edits",
        {
          model: "text-davinci-edit-001",
          input: body,
          instruction:
            "一人称が省略されていれば追加。敬語を除く。すべての文の語尾を連体形に変更し最後に「めう」とつける。わたしや俺などの一人称を「めう」に変更。",
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      if (data.choices.length > 0) {
        setMessage("変換成功めう！")
        setResponse(data)
      } else {
        throw "生成失敗めう..."
      }
    } catch (e) {
      setMessage(`エラーめう... (${e})`)
    }
  }
  return (
    <>
      <section
        style={{ padding: "4rem 2rem", maxWidth: "720px", margin: "auto" }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            borderBottom: "2px solid pink",
            fontSize: "2rem",
          }}
        >
          めう語生成機(α)
        </h1>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "auto",
            padding: "2rem 0",
          }}
          onSubmit={submit}
        >
          <input
            placeholder="OPENAIのAPI Keyをいれるめう!"
            type="password"
            style={{
              fontSize: "1.5rem",
              padding: ".5rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <textarea
            rows={4}
            placeholder="変換したい文章を入力するめう!"
            style={{
              fontSize: "1.5rem",
              padding: ".5rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            style={{
              padding: "1rem 2rem",
              backgroundColor: "pink",
              color: "white",
              borderRadius: "5px",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
            disabled={!body || !apiKey}
          >
            変換するめう！
          </button>
        </form>
        <div
          style={{
            margin: "1rem auto",
          }}
        >
          {message && (
            <p
              style={{
                color: "gray",
                padding: ".5rem",
                textAlign: "center",
              }}
            >
              {message}
            </p>
          )}
          {response && response.choices.length > 0 && (
            <>
              {response.choices.map((choice) => (
                <p
                  key={choice.index}
                  style={{ fontSize: "2rem", borderBottom: "solid pink 2px" }}
                >
                  {choice.text}
                </p>
              ))}
            </>
          )}
        </div>
      </section>
      <footer
        style={{
          background: "pink",
          marginTop: "4rem",
          padding: "4rem",
          textAlign: "center",
          color: "white",
        }}
      >
        @kixixixixi
        <p>
          <a
            href="//github.com/kixixixixi/txt2meu"
            style={{ color: "white", textDecoration: "none" }}
          >
            View on Github
          </a>
        </p>
      </footer>
    </>
  )
}

export default IndexPage
