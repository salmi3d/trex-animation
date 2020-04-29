import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import vertex from './shader/vertex.glsl'
import fragment from './shader/fragment.glsl'

import trex from './model/trex.glb'
import matcap from './img/matcap.png'

const OrbitControls = require('three-orbit-controls')(THREE)

class App {

  constructor({ el }) {
    this.container = el
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.time = 0
    this.paused = false
    this.pointsCount = 1000

    this.init()
  }

  init() {
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0xeeeeee, 1)
    this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = THREE.sRGBEncoding

    const progress = document.createElement('div')
    progress.classList.add('progress')

    this.container.appendChild(progress)

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 1000)
    this.camera.position.set(0, 0, 150)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.loader = new GLTFLoader()

    this.setSettings()
    this.bindResize()
    this.bindVisibility()
    this.bindMouse()
    this.addObjects()
    this.resize()
    this.render()
    this.loader.load(
      trex,
      object => {
        progress.remove()
        this.container.appendChild(this.renderer.domElement)
        this.mesh = object.scene.children[0].children[0]
        this.mesh.rotation.z = Math.PI / 10
        this.mesh.rotation.x = -(Math.PI / 2)

        this.mesh.material = this.material
        // this.mesh.material = new THREE.MeshMatcapMaterial({
        //   matcap: new THREE.TextureLoader().load(matcap)
        // })

        this.scene.add(this.mesh)
      },
      e => progress.style.setProperty('--progress', e.loaded / e.total * 100)
    )
  }

  render() {
    if (this.paused) {
      return
    }
    this.time += 0.05
    this.material.uniforms.time.value = this.time
    this.material.uniforms.progress.value = this.settings.progress
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
  }

  bindResize() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives'
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        progress: { type: 'f', value: this.settings.progress },
        resolution: { type: 'v4', value: new THREE.Vector4() },
        matcap: { type: 't', value: new THREE.TextureLoader().load(matcap) },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    })
    this.geometry = new THREE.PlaneGeometry(80, 80, 1, 1)
    this.plane = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.95, transparent: true }))
    this.plane.position.z = 60
    this.scene.add(this.plane)
  }

  bindVisibility() {
    document.addEventListener('visibilitychange', () => document.hidden ? this.pause() : this.play())
  }

  pause() {
    this.paused = true
  }

  play() {
    this.paused = false
  }

  setSettings() {
    this.settings = {
      progress: -1,
    }
    // this.gui = new dat.GUI()
    // this.gui.add(this.settings, 'progress', -1, 1, 0.01)
  }

  bindMouse() {
    const on = ['mousedown', 'touchstart']
    const off = ['mouseup', 'touchend']

    on.forEach(e => {
      window.addEventListener(e, () => {
        gsap.to(this.mesh.position, {
          duration: 1,
          z: 50,
        })

        gsap.to(this.settings, {
          duration: 1,
          progress: 1
        })
      })
    })

    off.forEach(e => {
      window.addEventListener(e, () => {
        gsap.to(this.mesh.position, {
          duration: 1,
          z: 0,
        })

        gsap.to(this.settings, {
          duration: 1,
          progress: -1
        })
      })
    })

  }

}

new App({ el: document.getElementById('app') })
