export interface SceneObject {
    id: string;
    type: 'cube' | 'triangle' | 'square';
    color: string;
}
export declare class ThreeViewer {
    private scene;
    private camera;
    private renderer;
    private meshes;
    private animationFrameId;
    private container;
    constructor(container: HTMLElement);
    private onWindowResize;
    private createGeometry;
    load(objects: SceneObject[]): void;
    update(objects: SceneObject[]): void;
    private animate;
    destroy(): void;
}
export declare function createViewer(container: HTMLElement): ThreeViewer;
