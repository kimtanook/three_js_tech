import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/Addons.js";
import {lerp} from "three/src/math/MathUtils.js";

const Lerp = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const [positions, setPositions] = useState<Float32Array | null>(null); // 원래 위치 저장
  const [animatedPositions, setAnimatedPositions] =
    useState<Float32Array | null>(null); // 애니메이션 위치

  const handleScroll = () => {
    if (!positions || !animatedPositions) return;

    const scrollTop = window.scrollY;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Number(((scrollTop / scrollHeight) * 100).toFixed(2));

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;

      // 현재 점의 원래 위치
      const originalX = positions[i3];
      const originalY = positions[i3 + 1];
      const originalZ = positions[i3 + 2];

      // 랜덤한 거리 생성
      const randomDistance = 10; // 최대 퍼지는 거리

      if (scrollPercent < 50) {
        // 스크롤이 0%에서 50%까지
        animatedPositions[i3] = lerp(
          originalX,
          originalX +
            Math.random() * randomDistance * (Math.random() < 0.5 ? 1 : -1), // 랜덤하게 퍼짐
          scrollPercent / 50 // 50%에 도달하면 최대 이동
        );
        animatedPositions[i3 + 1] = lerp(
          originalY,
          originalY +
            Math.random() * randomDistance * (Math.random() < 0.5 ? 1 : -1),
          scrollPercent / 50
        );
        animatedPositions[i3 + 2] = lerp(
          originalZ,
          originalZ +
            Math.random() * randomDistance * (Math.random() < 0.5 ? 1 : -1),
          scrollPercent / 50
        );
      } else {
        // 스크롤이 50% 이상일 때
        animatedPositions[i3] = lerp(
          originalX +
            Math.random() * randomDistance * (Math.random() < 0.5 ? 1 : -1),
          originalX,
          (scrollPercent - 50) / 50 // 50%에서 100%까지 원래 위치로 돌아오기
        );
        animatedPositions[i3 + 1] = lerp(
          originalY +
            Math.random() * randomDistance * (Math.random() < 0.5 ? 1 : -1),
          originalY,
          (scrollPercent - 50) / 50
        );
        animatedPositions[i3 + 2] = lerp(
          originalZ +
            Math.random() * randomDistance * (Math.random() < 0.5 ? 1 : -1),
          originalZ,
          (scrollPercent - 50) / 50
        );
      }
    }

    // 업데이트된 애니메이션 위치를 포인트의 위치에 적용
    (pointsRef.current?.geometry as THREE.BufferGeometry).setAttribute(
      "position",
      new THREE.BufferAttribute(animatedPositions, 3)
    );
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true; // 위치 업데이트 표시
    }
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({antialias: true});
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;

    renderer.setSize(window.innerWidth, window.innerHeight);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    const parameters = {
      count: 500,
      size: 0.02,
    };

    const generateGalaxy = () => {
      // Geometry
      const geometry = new THREE.BufferGeometry();
      const positionsArray = new Float32Array(parameters.count * 3);
      const animatedPositionsArray = new Float32Array(parameters.count * 3);

      for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;

        // 원래 위치 설정
        positionsArray[i3] = (Math.random() - 0.5) * 3; // X position
        positionsArray[i3 + 1] = (Math.random() - 0.5) * 3; // Y position
        positionsArray[i3 + 2] = (Math.random() - 0.5) * 3; // Z position
      }
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positionsArray, 3)
      );

      // Material
      const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      // Points
      const points = new THREE.Points(geometry, material);
      scene.add(points);
      pointsRef.current = points;
      setPositions(positionsArray);
      setAnimatedPositions(animatedPositionsArray);
    };

    generateGalaxy();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function to dispose of resources
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 위치 설정

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [positions, animatedPositions]);

  return (
    <div className="lerp_wrap">
      <div className="lerp_container" ref={containerRef} />
    </div>
  );
};

export default Lerp;
