import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownContent.css';

const MarkdownContent = ({ children }: { children: string }) => (
  <div className="MarkdownContent">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node: _node, children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export default MarkdownContent;
