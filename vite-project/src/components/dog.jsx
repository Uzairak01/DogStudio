import React, { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useGLTF, useTexture, useAnimations } from '@react-three/drei'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ✅ Register plugins once, outside the component
gsap.registerPlugin(useGSAP, ScrollTrigger)

// ✅ Data-driven hover config — easy to extend
const HOVER_CONFIG = [
  { selector: '[img-title="tomorrowland"]', matIndex: 18 }, // mat19 = index 18
  { selector: '[img-title="navy-pier"]',    matIndex: 7  },
  { selector: '[img-title="msi-chicago"]',  matIndex: 8  },
  { selector: '[img-title="phone"]',        matIndex: 11 },
  { selector: '[img-title="kikk"]',         matIndex: 9  },
  { selector: '[img-title="kennedy"]',      matIndex: 7  },
  { selector: '[img-title="opera"]',        matIndex: 12 },
]

const MATCAP_PATHS = Array.from(
  { length: 20 },
  (_, i) => `/matcap/mat-${i + 1}.png`
)

const Dog = () => {
  const model = useGLTF('/models/dog.drc.glb')
  const { actions } = useAnimations(model.animations, model.scene)

  useThree(({ camera, gl }) => {
    camera.position.z = 0.55
    gl.toneMapping = THREE.ReinhardToneMapping
    gl.outputColorSpace = THREE.SRGBColorSpace
  })

  // ✅ Play animation on mount
  useEffect(() => {
    actions['Take 001']?.play()
  }, [actions])

  // Textures
  const [normalMap] = useTexture(['/models/dog_normals.jpg']).map(t => {
    t.flipY = false
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })

  const [branchMap, branchNormalMap] = useTexture([
  '/models/branches_diffuse.jpeg',   // ← add /models/
  '/models/branches_normals.jpeg',   // ← add /models/
]).map(t => {
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })

  const matcaps = useTexture(MATCAP_PATHS).map(t => {
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })

  // ✅ Shared uniforms object — same reference used by shader AND GSAP
  const uniforms = useRef({
    uMatcapTexture1: { value: matcaps[18] }, // mat19
    uMatcapTexture2: { value: matcaps[1]  }, // mat2
    uProgress:       { value: 1.0 },
  })

  // ✅ Stable onBeforeCompile — defined once
  const onBeforeCompile = useMemo(() => (shader) => {
    Object.assign(shader.uniforms, uniforms.current)

    shader.fragmentShader = shader.fragmentShader.replace(
      'void main() {',
      `uniform sampler2D uMatcapTexture1;
       uniform sampler2D uMatcapTexture2;
       uniform float uProgress;
       void main() {`
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      'vec4 matcapColor = texture2D( matcap, uv );',
      `vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
       vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
       float progress = smoothstep(
         uProgress - 0.2,
         uProgress,
         (vViewPosition.x + vViewPosition.y) * 0.5 + 0.5
       );
       vec4 matcapColor = mix(matcapColor2, matcapColor1, progress);`
    )
  }, []) // no deps — uniforms ref is stable

  // ✅ Materials created once with useMemo
  const dogMaterial = useMemo(() => {
    const mat = new THREE.MeshMatcapMaterial({
      normalMap,
      matcap: matcaps[1],
    })
    mat.onBeforeCompile = onBeforeCompile
    return mat
  }, [normalMap, onBeforeCompile])

  const branchMaterial = useMemo(() => new THREE.MeshMatcapMaterial({
    normalMap: branchNormalMap,
    map: branchMap,
  }), [branchMap, branchNormalMap])

  // Apply materials to model
  useMemo(() => {
    model.scene.traverse(child => {
      if (child.isMesh) {
        child.material = child.name.includes('DOG') ? dogMaterial : branchMaterial
      }
    })
  }, [model.scene, dogMaterial, branchMaterial])

  // ✅ Scroll-driven animation
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#section-1',
        endTrigger: '#section-3',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    })

    tl.to(model.scene.position, { z: '-=0.75', y: '+=0.1' })
      .to(model.scene.rotation, { x: `+=${Math.PI / 15}` })
      .to(model.scene.rotation, { y: `-=${Math.PI}` }, 'third')
      .to(model.scene.position, { x: '-=0.5', z: '+=0.6', y: '-=0.05' }, 'third')
  }, [])

  // ✅ Hover listeners — data-driven, with cleanup
  useEffect(() => {
    const DEFAULT_MAT_INDEX = 1 // mat2

    const triggerTransition = (toIndex) => {
      uniforms.current.uMatcapTexture1.value = matcaps[toIndex]
      gsap.to(uniforms.current.uProgress, {
        value: 0.0,
        duration: 0.3,
        onComplete: () => {
          uniforms.current.uMatcapTexture2.value = matcaps[toIndex]
          uniforms.current.uProgress.value = 1.0
        },
      })
    }

    const listeners = []

    HOVER_CONFIG.forEach(({ selector, matIndex }) => {
      const el = document.querySelector(`.title${selector}`)
      if (!el) return
      const handler = () => triggerTransition(matIndex)
      el.addEventListener('mouseenter', handler)
      listeners.push({ el, event: 'mouseenter', handler })
    })

    // Reset on mouse leave
    const titlesEl = document.querySelector('.titles')
    if (titlesEl) {
      const resetHandler = () => triggerTransition(DEFAULT_MAT_INDEX)
      titlesEl.addEventListener('mouseleave', resetHandler)
      listeners.push({ el: titlesEl, event: 'mouseleave', handler: resetHandler })
    }

    // ✅ Cleanup all listeners on unmount
    return () => {
      listeners.forEach(({ el, event, handler }) =>
        el.removeEventListener(event, handler)
      )
    }
  }, [matcaps])

  return (
    <>
      <primitive
        object={model.scene}
        position={[0.25, -0.55, 0]}
        rotation={[0, Math.PI / 3.9, 0]}
      />
      <directionalLight position={[0, 5, 5]} color={0xffffff} intensity={10} />
    </>
  )
}

export default Dog