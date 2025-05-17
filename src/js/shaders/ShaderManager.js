
"use strict";


class ShaderManager {


	static hipsVS() {
		return `#version 300 es
		
		in vec3 aVertexPosition;
		in vec2 aTextureCoord;
		
		uniform mat4 uMMatrix;
		uniform mat4 uVMatrix;
		uniform mat4 uPMatrix;
		
		out vec2 vTextureCoord;
		
		void main() {
			gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
			vTextureCoord = aTextureCoord;
		}`;
	}

	static hipsNativeFS() {
		return `#version 300 es

		precision mediump float;
  
		in vec2 vTextureCoord;
	
		uniform sampler2D uSampler0;
		uniform sampler2D uSampler1;
		uniform sampler2D uSampler2;
		uniform sampler2D uSampler3;
		uniform sampler2D uSampler4;
		uniform sampler2D uSampler5;
		uniform sampler2D uSampler6;
		uniform sampler2D uSampler7;
	
		uniform float uFactor0;
		uniform float uFactor1;
		uniform float uFactor2;
		uniform float uFactor3;
		uniform float uFactor4;
		uniform float uFactor5;
		uniform float uFactor6;
		uniform float uFactor7;
	
		out vec4 fragColor;
	
		void main() {
			vec3 finalColor;
	
			if (uFactor0 >= 0.0){
				vec4 mycolor;
				#if __VERSION__ > 120
					vec4 color0 = texture(uSampler0, vTextureCoord);
				#else
					vec4 color0 = texture2D(uSampler0, vTextureCoord);
				#endif

				mycolor = color0;
				finalColor = vec3(mycolor.x *uFactor0, mycolor.y*uFactor0, mycolor.z*uFactor0); 
			} else if (uFactor7 >= 0.0){
				finalColor = vec3(1.0, 0.0, 0.0);
			}
			fragColor = vec4(finalColor, 1);
		} `;
	}

	static hipsGrayscaleFS() {
		return `#version 300 es

		precision mediump float;
  
		in vec2 vTextureCoord;
	
		uniform sampler2D uSampler0;
		uniform sampler2D uSampler1;
		uniform sampler2D uSampler2;
		uniform sampler2D uSampler3;
		uniform sampler2D uSampler4;
		uniform sampler2D uSampler5;
		uniform sampler2D uSampler6;
		uniform sampler2D uSampler7;
	
		uniform float uFactor0;
		uniform float uFactor1;
		uniform float uFactor2;
		uniform float uFactor3;
		uniform float uFactor4;
		uniform float uFactor5;
		uniform float uFactor6;
		uniform float uFactor7;
	
		out vec4 fragColor;
	
		void main() {
			vec3 finalColor;
			

			if (uFactor0 >= 0.0){
				
				#if __VERSION__ > 120
					vec4 color0 = texture(uSampler0, vTextureCoord);
				#else
					vec4 color0 = texture2D(uSampler0, vTextureCoord);
				#endif
				float gray = 0.21 * color0.r + 0.71 * color0.g + 0.07 * color0.b;
				finalColor = vec3(color0.rgb * (1.0 - uFactor0) + (gray * uFactor0));
			}
			
			if (uFactor1 >= 0.0){
				#if __VERSION__ > 120
					vec4 color1 = texture(uSampler1, vTextureCoord);
				#else
					vec4 color1 = texture2D(uSampler1, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color1.x*uFactor1,finalColor.y +  color1.y*uFactor1,finalColor.z +  color1.z*uFactor1);
			}
			if (uFactor2 >= 0.0){
				#if __VERSION__ > 120
					vec4 color2 = texture(uSampler2, vTextureCoord);
				#else
					vec4 color2 = texture2D(uSampler2, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color2.x*uFactor2,finalColor.y +  color2.y*uFactor2,finalColor.z +  color2.z*uFactor2);
			}
			if (uFactor3 >= 0.0){
				#if __VERSION__ > 120
					vec4 color3 = texture(uSampler3, vTextureCoord);
				#else
					vec4 color3 = texture2D(uSampler3, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color3.x*uFactor3,finalColor.y +  color3.y*uFactor3,finalColor.z +  color3.z*uFactor3);
			}
			if (uFactor4 >= 0.0){
				#if __VERSION__ > 120
					vec4 color4 = texture(uSampler4, vTextureCoord);
				#else
					vec4 color4 = texture2D(uSampler4, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color4.x*uFactor4,finalColor.y +  color4.y*uFactor4,finalColor.z +  color4.z*uFactor4);
			}
			if (uFactor5 >= 0.0){
				#if __VERSION__ > 120
					vec4 color5 = texture(uSampler5, vTextureCoord);
				#else
					vec4 color5 = texture2D(uSampler5, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color5.x*uFactor5,finalColor.y +  color5.y*uFactor5,finalColor.z +  color5.z*uFactor5);
			}
			if (uFactor6 >= 0.0){
				#if __VERSION__ > 120
					vec4 color6 = texture(uSampler6, vTextureCoord);
				#else
					vec4 color6 = texture2D(uSampler6, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color6.x*uFactor6,finalColor.y +  color6.y*uFactor6,finalColor.z +  color6.z*uFactor6);
			}
			if (uFactor7 >= 0.0){
				#if __VERSION__ > 120
					vec4 color7 = texture(uSampler7, vTextureCoord);
				#else
					vec4 color7 = texture2D(uSampler7, vTextureCoord);
				#endif
				finalColor = vec3(finalColor.x +  color7.x*uFactor7,finalColor.y +  color7.y*uFactor7,finalColor.z +  color7.z*uFactor7);
			}
			fragColor = vec4(finalColor, 1);
		} `;
	}


	static hipsColorMapFS() {
		return `#version 300 es
		
		precision mediump float;
		
		in vec2 vTextureCoord;
		
		// UBO
		layout (std140) uniform colormap {
			float r_palette[256];
			float g_palette[256];
			float b_palette[256];
		};
		
		
		uniform sampler2D uSampler0;
		uniform float uFactor0;	
		out vec4 fragColor;
	
		void main() {
		
			#if __VERSION__ > 120
				vec4 color0 = texture(uSampler0, vTextureCoord);
			#else
				vec4 color0 = texture2D(uSampler0, vTextureCoord);
			#endif

			int x = int(color0.r * 255.0);
			float px = r_palette[x]/256.0;
			
			int y = int(color0.g * 255.0);
			float py = g_palette[y]/256.0;
			
			int z = int(color0.b * 255.0);
			float pz = b_palette[z]/256.0;
		
			fragColor = vec4(px, py, pz, 1);
		} `;
	}

	

}

export default ShaderManager;