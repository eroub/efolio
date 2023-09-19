// Error.tsx
interface ErrorProps {
  message: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => (
  <div>Error: {message}</div>
);

export default Error;
