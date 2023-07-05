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

const norm = (a: number[]): number =>
  a.reduce((prev, curr) => curr ** 2 + prev) ** (1 / 2)

const cosin = (a: number[], b: number[]): number | undefined => {
  if (a.length != b.length) return
  const innerProduct = a
    .map((r, i) => r * b[i])
    .reduce((prev, curr) => prev + curr, 0)
  return innerProduct / (norm(a) * norm(b))
}

const IndexPage: NextPage = () => {
  const [apiKey, setApiKey] = useState<string>()
  const [bodies, setBodies] = useState<string[]>(["", ""])
  const [message, setMessage] = useState<string>()
  const [responses, setResponses] = useState<Response[]>()
  useEffect(() => {
    const storageApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY)
    if (storageApiKey) setApiKey(storageApiKey)
  }, [])
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("Requesting...")
    setResponses(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const responses = await Promise.all(
        bodies
          .filter((body) => body.length > 0)
          .map((body) =>
            axios.post<Response>(
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
          )
      )
      const dataList = responses.map((response) => response.data)
      if (dataList.every((data) => data.data.length > 0)) {
        setMessage("Complete!")
        setResponses(dataList)
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
          {bodies.map((body, index) => (
            <textarea
              key={index}
              rows={4}
              placeholder={`Text${index + 1}`}
              style={{
                fontSize: "1.5rem",
                padding: ".5rem 1rem",
                width: "100%",
                marginBottom: "10px",
              }}
              value={body}
              onChange={(e) => {
                const newBodies = [...bodies]
                newBodies[index] = e.target.value
                setBodies(newBodies)
              }}
            />
          ))}
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
            disabled={!bodies.some((b) => b.length > 0) || !apiKey}
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
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              margin: "auto",
            }}
          >
            <div>
              {responses &&
                responses.length == 2 &&
                cosin(
                  responses[0].data[0].embedding,
                  responses[1].data[0].embedding
                )}
            </div>
            {responses &&
              responses.map((response) => (
                <>
                  {response.data.map((data) => (
                    <>
                      <table>
                        <tr>
                          <td>Total token</td>
                          <td>{response.usage.total_tokens}</td>
                        </tr>
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
              ))}
          </div>
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
