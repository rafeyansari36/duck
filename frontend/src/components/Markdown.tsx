import ReactMarkdown from 'react-markdown'

type MarkdownProps = {
  children: string
}

export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="markdown">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  )
}
