import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={() => navigate("/create-quiz")}>Create Quiz</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}