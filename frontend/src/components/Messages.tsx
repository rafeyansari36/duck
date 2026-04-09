type MessagesProps = {
  error?: string
  info?: string
}

export default function Messages({ error, info }: MessagesProps) {
  return (
    <>
      {error && <div className="error">{error}</div>}
      {info && <div className="hint">{info}</div>}
    </>
  )
}
