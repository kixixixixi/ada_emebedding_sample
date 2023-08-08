import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { NextPage } from "next"
import axios from "axios"
import type { AxiosResponse } from "axios"

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

const cosine = (a: number[], b: number[]): number | undefined => {
  if (a.length != b.length) return
  const innerProduct = a
    .map((r, i) => r * b[i])
    .reduce((prev, curr) => prev + curr, 0)
  return innerProduct / (norm(a) * norm(b))
}

const IndexPage: NextPage = () => {
  const [apiKey, setApiKey] = useState<string>()
  const [base, setBase] = useState<string>("")
  const [bodies, setBodies] = useState<string[]>([""])
  const [message, setMessage] = useState<string>()
  const [responses, setResponses] = useState<Response[]>()
  const [baseResponse, setBaseResponse] = useState<Response>()
  useEffect(() => {
    const storageApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY)
    if (storageApiKey) setApiKey(storageApiKey)
  }, [])

  const request = async (
    body: string
  ): Promise<AxiosResponse<Response, any>> => {
    return await axios.post<Response>(
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
  }
  const fetchBase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("Requesting...")
    setResponses(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const response = (await request(base)).data
      if (response.data.length > 0) {
        setMessage("Complete!")
        setBaseResponse(response)
      } else {
        throw "Failed..."
      }
    } catch (e) {
      setMessage(`Error... (${e})`)
    }
  }
  const fetchTarget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey) return
    setMessage("Requesting...")
    setResponses(undefined)
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, apiKey)
    try {
      const responses = await Promise.all([
        ...bodies
          .filter((body) => body.length > 0)
          .map((body) => request(body)),
      ])
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
        style={{ padding: "4rem 2rem", maxWidth: "80rem", margin: "auto" }}
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
          onSubmit={fetchBase}
        >
          <input
            placeholder="OPENAI API key"
            type="password"
            style={{
              fontSize: "1rem",
              padding: ".5rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <input
            placeholder="Base text"
            style={{
              fontSize: "1rem",
              padding: ".5rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
          <button
            style={{
              padding: ".5rem 2rem",
              backgroundColor: "gray",
              color: "white",
              borderRadius: "5px",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            disabled={base.length == 0 || !apiKey}
          >
            Fetch base embedding
          </button>
        </form>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "auto",
            padding: "2rem 0",
          }}
          onSubmit={fetchTarget}
        >
          <textarea
            style={{
              fontSize: "1rem",
              padding: ".25rem 1rem",
              width: "100%",
              marginBottom: "10px",
            }}
            placeholder="Target text list"
            onChange={(e) => {
              const newBodies = e.target.value.split("\n")
              setBodies(newBodies)
            }}
          />
          {bodies.map((body, index) => (
            <div
              key={index}
              style={{
                borderBottom: "solid 1px #333",
                fontSize: "1rem",
                padding: ".05rem 1rem",
                width: "100%",
              }}
            >
              {body}
            </div>
          ))}
          <br />
          <button
            style={{
              padding: ".5rem 2rem",
              backgroundColor: "gray",
              color: "white",
              borderRadius: "5px",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            disabled={!bodies.some((b) => b.length > 0) || !apiKey}
          >
            Fetch target embedding
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
              flexDirection: "column",
              margin: "auto",
            }}
          >
            {responses && responses.length > 1 && (
              <>
                <table>
                  <tr>
                    <th>#</th>
                    <th>Base</th>
                    {responses.map((_, index) => (
                      <th>Text{index + 1}</th>
                    ))}
                  </tr>
                  <tr>
                    <th>Total token</th>
                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      {baseResponse?.usage.total_tokens}
                    </td>
                    {responses.map((response) => (
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {response.usage.total_tokens}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Cosine</th>
                    <td>-</td>
                    {responses.map((response) => (
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {baseResponse &&
                          cosine(
                            baseResponse.data[0].embedding,
                            response.data[0].embedding
                          )}
                      </td>
                    ))}
                  </tr>
                  {responses[0].data[0].embedding.map((score, index) => (
                    <tr key={index}>
                      <th>#{index + 1}</th>
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {score}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                        }}
                      >
                        {baseResponse?.data[0].embedding[index]}
                      </td>
                      {responses.slice(1).map((response) => (
                        <td
                          style={{
                            textAlign: "right",
                          }}
                        >
                          {response.data[0].embedding[index]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </table>
              </>
            )}
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
