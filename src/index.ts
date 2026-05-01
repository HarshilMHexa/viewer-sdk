import * as THREE from 'three';

export interface SceneObject {
  id: string;
  type: 'cube' | 'triangle' | 'square';
  color: string; // hex string
}

export class ThreeViewer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private meshes: Record<string, THREE.Mesh> = {};
  private animationFrameId: number | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f0f0f0');

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize);

    this.animate();
  }

  private onWindowResize = () => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  private createGeometry(type: 'cube' | 'triangle' | 'square'): THREE.BufferGeometry {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'triangle':
        return new THREE.ConeGeometry(0.8, 1.5, 3); // A cone with 3 radial segments looks like a 3D triangle/pyramid
      case 'square':
        return new THREE.PlaneGeometry(1.5, 1.5);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  public load(objects: SceneObject[]) {
    // Clear existing
    Object.values(this.meshes).forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    this.meshes = {};

    objects.forEach(obj => {
      const geometry = this.createGeometry(obj.type);
      const material = new THREE.MeshStandardMaterial({ 
        color: obj.color,
        side: obj.type === 'square' ? THREE.DoubleSide : THREE.FrontSide
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Fixed positions based on type
      if (obj.type === 'triangle') mesh.position.x = -2;
      if (obj.type === 'cube') mesh.position.x = 0;
      if (obj.type === 'square') mesh.position.x = 2;

      // Keep them facing the camera, nicely rotated
      if (obj.type === 'cube') {
        mesh.rotation.x = Math.PI / 6;
        mesh.rotation.y = Math.PI / 6;
      }

      this.scene.add(mesh);
      this.meshes[obj.id] = mesh;
    });
  }

  public update(objects: SceneObject[]) {
    objects.forEach(obj => {
      const mesh = this.meshes[obj.id];
      if (mesh) {
        (mesh.material as THREE.MeshStandardMaterial).color.set(obj.color);
      }
    });
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    Object.values(this.meshes).forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    });
    
    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

export function createViewer(container: HTMLElement): ThreeViewer {
  return new ThreeViewer(container);
}
