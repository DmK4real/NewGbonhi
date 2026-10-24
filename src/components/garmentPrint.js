import * as THREE from 'three';

// Original artwork is sampled as a separate decal. Generated assets contain
// only blank cotton, so lettering and logos never pass through generation.
export function applyOriginalPrint(material, originalMap, piece) {
  const [left, top, right, bottom] = piece.printRegion;
  material.onBeforeCompile = shader => {
    const [scaleX, scaleY] = piece.printScale || [1, 1];
    const [centerX, centerY] = piece.printCenter || [.5, .5];
    shader.uniforms.printPlacement = { value: new THREE.Vector4(scaleX, scaleY, centerX, 1 - centerY) };
    shader.uniforms.fabricPoint = { value: new THREE.Vector3(...(piece.fabricPoint || [0, 0]), piece.fabricPoint ? 1 : 0) };
    shader.uniforms.originalPrint = { value: originalMap };
    shader.uniforms.printRect = { value: new THREE.Vector4(left, 1 - bottom, right, 1 - top) };
    shader.uniforms.whiteCotton = { value: piece.whiteFabric ? 1 : 0 };
    shader.uniforms.cleanWhitePrint = { value: piece.cleanWhitePrint ? 1 : 0 };
    shader.uniforms.posterPrint = { value: piece.posterPrint || piece.product?.slug === 'arw-film-dopamine-tee' ? 1 : 0 };
    shader.fragmentShader = 'uniform vec4 printPlacement;\nuniform vec3 fabricPoint;\nuniform sampler2D originalPrint;\nuniform vec4 printRect;\nuniform float whiteCotton;\nuniform float cleanWhitePrint;\nuniform float posterPrint;\n' + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec4 cotton = texture2D(map, vMapUv);
        vec2 printUv = (vMapUv - printPlacement.zw) / printPlacement.xy + vec2(.5);
        vec4 originalSample = texture2D(originalPrint, printUv);
        vec3 sourcePrint = originalSample.rgb;
        vec3 fabricLeft = texture2D(originalPrint, vec2(.22, printUv.y)).rgb;
        vec3 fabricRight = texture2D(originalPrint, vec2(.78, printUv.y)).rgb;
        vec3 originalCotton = mix(fabricLeft, fabricRight, smoothstep(.22, .78, printUv.x));
        originalCotton = mix(originalCotton, texture2D(originalPrint, vec2(fabricPoint.x, 1. - fabricPoint.y)).rgb, fabricPoint.z);
        if (cleanWhitePrint > .5 && printUv.y < .28) {
          vec3 nearby = max(sourcePrint, texture2D(originalPrint, printUv + vec2(.025, 0.)).rgb);
          nearby = max(nearby, texture2D(originalPrint, printUv - vec2(.025, 0.)).rgb);
          nearby = max(nearby, texture2D(originalPrint, printUv + vec2(0., .025)).rgb);
          nearby = max(nearby, texture2D(originalPrint, printUv - vec2(0., .025)).rgb);
          originalCotton = mix(nearby, originalCotton, smoothstep(.18, .28, printUv.y));
        }
        vec3 onWhite = cotton.rgb * sourcePrint / max(originalCotton, vec3(.12));
        vec3 onBlack = max(vec3(0.), cotton.rgb + sourcePrint - originalCotton);
        vec2 inner = smoothstep(printRect.xy, printRect.xy + vec2(.025), printUv);
        vec2 outer = vec2(1.) - smoothstep(printRect.zw - vec2(.025), printRect.zw, printUv);
        float decal = inner.x * inner.y * outer.x * outer.y;
        vec3 darkInk = originalCotton - sourcePrint;
        float whiteInk = smoothstep(.04, .14, max(darkInk.r, max(darkInk.g, darkInk.b)));
        // The archive pairs contain deep sleeve shadows. Above the faded hem
        // print, only their dark/red ink should transfer onto the new cotton.
        float cleanInk = smoothstep(.18, .35, max(darkInk.r, max(darkInk.g, darkInk.b)));
        whiteInk = mix(whiteInk, cleanInk, cleanWhitePrint * smoothstep(.18, .28, printUv.y));
        float chroma = max(sourcePrint.r, max(sourcePrint.g, sourcePrint.b)) - min(sourcePrint.r, min(sourcePrint.g, sourcePrint.b));
        float lightInk = max(sourcePrint.r - originalCotton.r, max(sourcePrint.g - originalCotton.g, sourcePrint.b - originalCotton.b));
        float blackInk = max(smoothstep(.004, .016, chroma), smoothstep(.012, .045, lightInk));
        float ink = mix(blackInk, whiteInk, whiteCotton);
        float poster = step(.315, printUv.x) * step(printUv.x, .676) * step(.25, printUv.y) * step(printUv.y, .773);
        decal *= max(ink, posterPrint * poster) * smoothstep(.90, .99, originalSample.a);
        diffuseColor *= vec4(mix(cotton.rgb, mix(onBlack, onWhite, whiteCotton), decal), cotton.a);
      #endif
    `);
  };
  material.customProgramCacheKey = () => 'showroom-original-print-on-cotton';
}
