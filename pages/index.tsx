import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { NextPage } from "next"
import axios from "axios"

const LOCAL_STORAGE_KEY_API_KEY = "OPENAI_API_KEY" as const

type Response = {
  object: "list"
  model: "text-embedding-ada-002"
  data: {
    object: "embedding"
    embedding: number[]
    index: number
  }[]
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

const IndexPage: NextPage = () => {
  const [apiKey, setApiKey] = useState<string>()
  const [body, setBody] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [response, setResponse] = useState<Response>()
  useEffect(() => {
    const storageApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY)
    if (storageApiKey) setApiKey(storageApiKey)
  }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("Requesting...")
    setResponse(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const { data } = await axios.post<Response>(
        "https://api.openai.com/v1/embeddings",
        {
          model: "text-embedding-ada-002",
          input: body,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      )
      if (data.data.length > 0) {
        setMessage("Complete!")
        setResponse(data)
      } else {
        throw "Failed..."
      }
    } catch (e) {
      setMessage(`Error... (${e})`)
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
            borderBottom: "2px solid gray",
            fontSize: "2rem",
          }}
        >
          Text embedding by ada
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
            placeholder="OPENAI API key"
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
            placeholder="Text"
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
              backgroundColor: "gray",
              color: "white",
              borderRadius: "5px",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
            disabled={!body || !apiKey}
          >
            Submit
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
          {response && response.data.length > 0 && (
            <>
              <p>Total token:{response.usage.total_tokens}</p>
              {response.data.map((data) => (
                <>
                  <table>
                    {data.embedding.map((score, index) => (
                      <tr key={index}>
                        <th>#{index + 1}</th>
                        <td>{score}</td>
                      </tr>
                    ))}
                  </table>
                </>
              ))}
            </>
          )}
        </div>
      </section>
      <footer
        style={{
          background: "gray",
          marginTop: "4rem",
          padding: "4rem",
          textAlign: "center",
          color: "white",
        }}
      >
        @kixixixixi
        <p>
          <a
            href="//github.com/kixixixixi/ada_emebedding_sample"
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
