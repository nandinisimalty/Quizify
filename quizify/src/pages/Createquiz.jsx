import { useState } from "react";

export default function CreateQuiz() {
  const [topic, setTopic] = useState("");

  return (
    <div>
      <h2>Create Quiz</h2>
      <input placeholder="Enter topic" onChange={(e) => setTopic(e.target.value)} />
      <button>Generate Quiz (AI later)</button>
    </div>
  );
}