import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const countChange = () => {
    setCount(count + 1)
  }

  return (
    <>
      <div onClick={countChange}>
        Portolio - ${count}
      </div>
    </>
  )
}

export default App
