import {useEffect, useRef} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/Addons.js";

function Sphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  let rotate = false; // useState 사용하면 리랜더링 -> 도르마무 됨.
  let position = false;

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    // 구체 생성
    const geometry = new THREE.SphereGeometry(10, 8, 8);
    const material = new THREE.MeshStandardMaterial({color: "#525252"});
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 렌더러 생성 및 DOM에 추가
    const renderer = new THREE.WebGLRenderer();

    // 컨트롤 이벤트 추가
    const controls = new OrbitControls(camera, renderer.domElement);

    // 특정 좌표에서 쏘는 빛
    const light = new THREE.DirectionalLight("white", 10);
    light.position.set(25, 25, 25); // 빛의 위치 설정
    scene.add(light);

    // 전체적인 빛 (밝기)
    const ambientLight = new THREE.AmbientLight("white", 0.5); // 강도 0.5
    scene.add(ambientLight);

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // 애니메이션 루프 설정
    const animate = () => {
      if (rotate) {
        sphere.rotation.x += 0.01; // x축으로 회전 각도 누적
        sphere.rotation.y += 0.01; // y축으로 회전 각도 누적
        sphere.rotation.z += 0.01; // z축으로 회전 각도 누적
      }

      if (position) {
        sphere.position.x += 0.1;
        sphere.position.y += 0.1;
        sphere.position.z += 0.1;
      }

      requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return (
    <>
      <div className="sphere_button_wrap">
        <button
          onClick={() => (position = !position)}
          className="sphere_button"
        >
          이동
        </button>
        <button onClick={() => (rotate = !rotate)} className="sphere_button">
          회전
        </button>
      </div>
      <div ref={containerRef} style={{width: "100vw", height: "100vh"}} />
    </>
  );
}

export default Sphere;
