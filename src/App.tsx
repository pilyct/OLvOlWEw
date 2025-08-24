import Layout from "./Layout";
import CommentSection from "./components/CommentSection";

function App() {
  return (
    <Layout
      title="Autarc - Frontend Code Challenge"
      description="The goal of this challenge is to create a React component where users can add and remove text-based comments."
    >
      <CommentSection />
    </Layout>
  );
}

export default App;
