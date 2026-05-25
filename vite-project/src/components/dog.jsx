import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

const Dog = () => {
  // 1. Fixed the public directory path
  const { scene } = useGLTF("/models/dog.drc.glb")
  
  // 2. Correctly using useThree inside a useEffect to set camera position
  const camera = useThree((state) => state.camera)
  
  useEffect(() => {
    camera.position.set(0, 0, .5)
  }, [camera])

  return (
    <>
      {/* 3. Lights should usually have an ambient fallback so shadows aren't pitch black */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, -0.5, 5]} intensity={2} />
      
      {/* 4. Pass the extracted scene directly */}
      <primitive object={scene} position={[0, 0, 0]} />
      
      <OrbitControls />
    </>
  )
}

export default Dog