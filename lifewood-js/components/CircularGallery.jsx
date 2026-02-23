import React, { useEffect, useRef, useState } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_uv;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_bend;

varying vec2 v_uv;

void main() {
  vec2 pos = u_center + (a_position * u_size);
  float normX = (u_center.x / u_resolution.x) * 2.0 - 1.0;
  pos.y += (1.0 - cos(normX * 1.57079632679)) * u_bend;

  vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  v_uv = a_uv;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_texture;
uniform float u_radius;

varying vec2 v_uv;

void main() {
  vec2 p = v_uv - 0.5;
  vec2 b = vec2(0.5 - u_radius);
  vec2 q = abs(p) - b;
  float sdf = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_radius;
  float alpha = 1.0 - smoothstep(0.0, 0.01, sdf);
  if (alpha <= 0.0) discard;

  vec4 tex = texture2D(u_texture, v_uv);
  gl_FragColor = vec4(tex.rgb, tex.a * alpha);
}
`;

const mod = (n, m) => ((n % m) + m) % m;

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createProgram = (gl) => {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
};

const drawCoverImage = (ctx, img, width, height) => {
  const scale = Math.max(width / img.width, height / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const x = (width - drawW) * 0.5;
  const y = (height - drawH) * 0.5;
  ctx.drawImage(img, x, y, drawW, drawH);
};

const drawWrappedText = (ctx, text, maxWidth, startX, startY, lineHeight, maxLines) => {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (let i = 0; i < words.length; i += 1) {
    const next = current ? `${current} ${words[i]}` : words[i];
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = words[i];
    }
  }

  if (current) lines.push(current);
  const limited = lines.slice(0, maxLines);
  limited.forEach((line, idx) => {
    ctx.fillText(line, startX, startY + idx * lineHeight);
  });
};

const makeFallbackCard = (title, description, kicker, textColor) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1f3a2c');
  gradient.addColorStop(1, '#10241a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  const softOverlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
  softOverlay.addColorStop(0, 'rgba(12, 26, 20, 0.18)');
  softOverlay.addColorStop(1, 'rgba(12, 26, 20, 0.38)');
  ctx.fillStyle = softOverlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const textOverlay = ctx.createLinearGradient(0, canvas.height * 0.52, 0, canvas.height);
  textOverlay.addColorStop(0, 'rgba(0, 0, 0, 0)');
  textOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.68)');
  ctx.fillStyle = textOverlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#d6c56a';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  return canvas;
};

const makeCardTextureSource = (img, title, description, kicker, textColor) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  drawCoverImage(ctx, img, canvas.width, canvas.height);

  const softOverlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
  softOverlay.addColorStop(0, 'rgba(12, 26, 20, 0.16)');
  softOverlay.addColorStop(1, 'rgba(12, 26, 20, 0.34)');
  ctx.fillStyle = softOverlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const textOverlay = ctx.createLinearGradient(0, canvas.height * 0.52, 0, canvas.height);
  textOverlay.addColorStop(0, 'rgba(0,0,0,0)');
  textOverlay.addColorStop(1, 'rgba(0,0,0,0.68)');
  ctx.fillStyle = textOverlay;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#d6c56a';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  return canvas;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });

const createTexture = (gl, source) => {
  const texture = gl.createTexture();
  if (!texture) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};

const CircularGallery = ({
  items = [],
  bend = 3,
  borderRadius = 0.05,
  textColor = '#ffffff',
  scrollSpeed = 2,
  scrollEase = 0.05,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hitRegionsRef = useRef([]);
  const detailOverlayRef = useRef(null);
  const selectedIndexRef = useRef(0);
  const isDetailOpenRef = useRef(true);
  const dragDistanceRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  useEffect(() => {
    if (!items.length) return;
    setSelectedIndex((prev) => Math.min(prev, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  useEffect(() => {
    isDetailOpenRef.current = isDetailOpen;
  }, [isDetailOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !items.length) return undefined;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) return undefined;

    const program = createProgram(gl);
    if (!program) return undefined;

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aUv = gl.getAttribLocation(program, 'a_uv');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uCenter = gl.getUniformLocation(program, 'u_center');
    const uSize = gl.getUniformLocation(program, 'u_size');
    const uBend = gl.getUniformLocation(program, 'u_bend');
    const uRadius = gl.getUniformLocation(program, 'u_radius');
    const uTexture = gl.getUniformLocation(program, 'u_texture');

    const quad = new Float32Array([
      -0.5, -0.5, 0, 0,
      0.5, -0.5, 1, 0,
      -0.5, 0.5, 0, 1,
      -0.5, 0.5, 0, 1,
      0.5, -0.5, 1, 0,
      0.5, 0.5, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    if (!buffer) return undefined;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    let rafId = 0;
    let targetOffset = 0;
    let currentOffset = targetOffset;
    let width = 0;
    let height = 0;
    let destroyed = false;
    let textures = [];
    let activePointerId = null;
    let isDragging = false;
    let lastDragX = 0;
    let resizeObserver = null;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.uniform2f(uResolution, width, height);
    };

    const onWheel = (event) => {
      if (event.target instanceof Element && event.target.closest('[data-gallery-detail-scroll="true"]')) {
        return;
      }
      targetOffset += event.deltaY * scrollSpeed * 0.35;
    };

    const onPointerDown = (event) => {
      activePointerId = event.pointerId;
      isDragging = true;
      lastDragX = event.clientX;
      dragDistanceRef.current = 0;
      if (container.setPointerCapture) {
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // no-op
        }
      }
    };

    const onPointerMove = (event) => {
      if (!isDragging || event.pointerId !== activePointerId) return;
      const dx = event.clientX - lastDragX;
      lastDragX = event.clientX;
      dragDistanceRef.current += Math.abs(dx);
      targetOffset -= dx * scrollSpeed * 1.4;
    };

    const onPointerUp = (event) => {
      if (event.pointerId !== activePointerId) return;
      isDragging = false;
      activePointerId = null;
      if (container.releasePointerCapture) {
        try {
          container.releasePointerCapture(event.pointerId);
        } catch {
          // no-op
        }
      }
    };

    const render = () => {
      if (destroyed) return;

      currentOffset += (targetOffset - currentOffset) * scrollEase;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);

      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(uTexture, 0);
      gl.uniform1f(uRadius, borderRadius);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      if (textures.length) {
        const maxCardWidth = width < 640 ? width * 0.82 : width < 1024 ? width * 0.5 : width * 0.36;
        const baseCardHeight = Math.max(260, Math.min(height * (width < 640 ? 0.62 : 0.68), 620));
        let cardWidth = Math.min(baseCardHeight * 0.74, maxCardWidth);
        cardWidth = Math.max(cardWidth, Math.min(width * 0.42, 220));
        const cardHeight = cardWidth / 0.74;
        const spacing = cardWidth * (width < 640 ? 0.78 : 0.88);
        const loopWidth = textures.length * spacing;
        const centerX = width * 0.5;
        const centerY = height * (width < 640 ? 0.4 : 0.35);
        const bendPx = bend * (width < 640 ? 30 : 40);
        const startOffset = mod(currentOffset, loopWidth);
        const drawList = [];

        for (let r = -1; r <= 1; r += 1) {
          for (let i = 0; i < textures.length; i += 1) {
            const x = centerX + (i * spacing + r * loopWidth - startOffset);
            if (x < -cardWidth || x > width + cardWidth) continue;
            const depth = Math.abs((x - centerX) / Math.max(width * 0.5, 1));
            drawList.push({ x, index: i, depth });
          }
        }

        drawList.sort((a, b) => b.depth - a.depth);
        hitRegionsRef.current = drawList.map((draw) => ({
          index: draw.index,
          left: draw.x - cardWidth * 0.5,
          right: draw.x + cardWidth * 0.5,
          top: centerY - cardHeight * 0.5,
          bottom: centerY + cardHeight * 0.5,
        }));

        const selectedRegions = hitRegionsRef.current.filter(
          (region) => region.index === selectedIndexRef.current
        );
        if (detailOverlayRef.current) {
          if (selectedRegions.length) {
            const selectedRegion = selectedRegions.reduce((best, region) => {
              if (!best) return region;
              const bestCenter = (best.left + best.right) * 0.5;
              const regionCenter = (region.left + region.right) * 0.5;
              return Math.abs(regionCenter - centerX) < Math.abs(bestCenter - centerX) ? region : best;
            }, null);

            if (selectedRegion) {
              const left = Math.max(0, selectedRegion.left);
              const top = Math.max(0, selectedRegion.top);
              const right = Math.min(width, selectedRegion.right);
              const bottom = Math.min(height, selectedRegion.bottom);
              detailOverlayRef.current.style.opacity = isDetailOpenRef.current ? '1' : '0';
              detailOverlayRef.current.style.transform = isDetailOpenRef.current ? 'translateY(0px)' : 'translateY(16px)';
              detailOverlayRef.current.style.pointerEvents = isDetailOpenRef.current ? 'auto' : 'none';
              detailOverlayRef.current.style.left = `${left}px`;
              detailOverlayRef.current.style.top = `${top}px`;
              detailOverlayRef.current.style.width = `${Math.max(0, right - left)}px`;
              detailOverlayRef.current.style.height = `${Math.max(0, bottom - top)}px`;
            }
          } else {
            detailOverlayRef.current.style.opacity = '0';
          }
        }

        for (let i = 0; i < drawList.length; i += 1) {
          const draw = drawList[i];
          gl.bindTexture(gl.TEXTURE_2D, textures[draw.index]);
          gl.uniform2f(uCenter, draw.x, centerY);
          gl.uniform2f(uSize, cardWidth, cardHeight);
          gl.uniform1f(uBend, bendPx);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    const initTextures = async () => {
      const loaded = await Promise.all(
        items.map(async (item) => {
          const title = item.text || item.title || '';
          const description = item.description || '';
          const kicker = item.kicker || 'AI PROJECT';
          try {
            const img = await loadImage(item.image);
            return makeCardTextureSource(img, title, description, kicker, textColor);
          } catch {
            return makeFallbackCard(title, description, kicker, textColor);
          }
        })
      );

      if (destroyed) return;
      textures = loaded
        .map((source) => createTexture(gl, source))
        .filter(Boolean);

      resize();
      render();
    };

    initTextures();
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resize);
    }

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resize);
      }
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [items, bend, borderRadius, textColor, scrollSpeed, scrollEase]);

  const selectedItem = items[selectedIndex] || items[0] || {};

  const handleGalleryClick = (event) => {
    if (dragDistanceRef.current > 8) {
      dragDistanceRef.current = 0;
      return;
    }
    dragDistanceRef.current = 0;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const regions = hitRegionsRef.current;

    for (let i = regions.length - 1; i >= 0; i -= 1) {
      const region = regions[i];
      if (x >= region.left && x <= region.right && y >= region.top && y <= region.bottom) {
        if (region.index === selectedIndexRef.current) {
          setIsDetailOpen((prev) => !prev);
        } else {
          setSelectedIndex(region.index);
          setIsDetailOpen(true);
        }
        break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleGalleryClick}
      className="relative min-h-[80vh] w-full overflow-hidden rounded-2xl"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full cursor-grab active:cursor-grabbing"
      />

      <div
        ref={detailOverlayRef}
        className="absolute z-10 rounded-2xl border border-[#d6c56a]/90 bg-gradient-to-b from-transparent via-[#0e1713]/74 to-[#0e1713]/98 p-4 sm:p-5 md:p-6 text-white overflow-hidden opacity-0 transition-[opacity,transform] duration-200"
      >
        <div className="h-full flex flex-col justify-end">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#d6c56a] mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
            {selectedItem.kicker || 'AI PROJECT'}
          </p>
          <h3 className="text-white text-xl sm:text-2xl md:text-[2rem] font-extrabold leading-tight mb-2 sm:mb-3 drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)]">
            {selectedItem.text || ''}
          </h3>
          <p
            data-gallery-detail-scroll="true"
            className="whitespace-pre-line text-[12px] sm:text-[13px] md:text-sm leading-relaxed text-white overflow-y-auto pr-1 max-h-[56%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]"
          >
            {selectedItem.description || ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircularGallery;
