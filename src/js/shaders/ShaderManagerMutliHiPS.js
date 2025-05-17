
"use strict";


class ShaderManagerMutliHiPS {


	static hipsVS () {
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
				finalColor = vec3(finalColor.x +  mycolor.x *uFactor0 ,finalColor.y +  mycolor.y*uFactor0,finalColor.z +  mycolor.z*uFactor0); 
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


	static hipsPlanckFS() {
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
  
	  struct colormap {
		  float r[256] ;
		  float g[256];
		  float b[256];
	  } planck;
  
	  colormap planckCMap() {
		  planck.r = float[256](0.00000, 0.769231, 1.53846, 2.30769, 3.07692, 3.84615, 4.61538, 5.38462, 6.15385, 6.92308, 7.69231, 8.46154,
		  9.23077, 10.0000, 11.5385, 13.0769, 14.6154, 16.1538, 17.6923, 19.2308, 20.7692, 22.3077, 23.8462, 25.3846,
		  26.9231, 28.4615, 30.0000, 33.8462, 37.6923, 41.5385, 45.3846, 49.2308, 53.0769, 56.9231, 60.7692, 64.6154,
		  68.4615, 72.3077, 76.1538, 80.0000, 88.5385, 97.0769, 105.615, 114.154, 122.692, 131.231, 139.769, 148.308,
		  156.846, 165.385, 173.923, 182.462, 191.000, 193.846, 196.692, 199.538, 202.385, 205.231, 208.077, 210.923,
		  213.769, 216.615, 219.462, 222.308, 225.154, 228.000, 229.182, 230.364, 231.545, 232.727, 233.909, 235.091,
		  236.273, 237.455, 238.636, 239.818, 241.000, 241.000, 241.364, 241.727, 242.091, 242.455, 242.818, 243.182,
		  243.545, 243.909, 244.273, 244.636, 245.000, 245.231, 245.462, 245.692, 245.923, 246.154, 246.385, 246.615,
		  246.846, 247.077, 247.308, 247.538, 247.769, 248.000, 248.146, 248.292, 248.438, 248.585, 248.731, 248.877,
		  249.023, 249.169, 249.315, 249.462, 249.608, 249.754, 249.900, 249.312, 248.723, 248.135, 247.546, 246.958,
		  246.369, 245.781, 245.192, 244.604, 244.015, 243.427, 242.838, 242.250, 239.308, 236.365, 233.423, 230.481,
		  227.538, 224.596, 221.654, 218.712, 215.769, 212.827, 209.885, 206.942, 204.000, 201.000, 198.000, 195.000,
		  192.000, 189.000, 186.000, 183.000, 180.000, 177.000, 174.000, 171.000, 168.000, 165.000, 161.077, 157.154,
		  153.231, 149.308, 145.385, 141.462, 137.538, 133.615, 129.692, 125.769, 121.846, 117.923, 114.000, 115.038,
		  116.077, 117.115, 118.154, 119.192, 120.231, 121.269, 122.308, 123.346, 124.385, 125.423, 126.462, 127.500,
		  131.423, 135.346, 139.269, 143.192, 147.115, 151.038, 154.962, 158.885, 162.808, 166.731, 170.654, 174.577,
		  178.500, 180.462, 182.423, 184.385, 186.346, 188.308, 190.269, 192.231, 194.192, 196.154, 198.115, 200.077,
		  202.038, 204.000, 205.962, 207.923, 209.885, 211.846, 213.808, 215.769, 217.731, 219.692, 221.654, 223.615,
		  225.577, 227.538, 229.500, 230.481, 231.462, 232.442, 233.423, 234.404, 235.385, 236.365, 237.346, 238.327,
		  239.308, 240.288, 241.269, 242.250, 242.642, 243.035, 243.427, 243.819, 244.212, 244.604, 244.996, 245.388,
		  245.781, 246.173, 246.565, 246.958, 247.350, 247.814, 248.277, 248.741, 249.205, 249.668, 250.132, 250.595,
		  251.059, 251.523, 251.986, 252.450);
		  planck.g = float[256](0.00000, 1.53846, 3.07692, 4.61538, 6.15385, 7.69231, 9.23077, 10.7692, 12.3077, 13.8462, 15.3846, 16.9231,
		  18.4615, 20.0000, 32.6154, 45.2308, 57.8462, 70.4615, 83.0769, 95.6923, 108.308, 120.923, 133.538, 146.154,
		  158.769, 171.385, 184.000, 187.923, 191.846, 195.769, 199.692, 203.615, 207.538, 211.462, 215.385, 219.308,
		  223.231, 227.154, 231.077, 235.000, 235.308, 235.615, 235.923, 236.231, 236.538, 236.846, 237.154, 237.462,
		  237.769, 238.077, 238.385, 238.692, 239.000, 239.077, 239.154, 239.231, 239.308, 239.385, 239.462, 239.538,
		  239.615, 239.692, 239.769, 239.846, 239.923, 240.000, 240.091, 240.182, 240.273, 240.364, 240.455, 240.545,
		  240.636, 240.727, 240.818, 240.909, 241.000, 241.000, 240.909, 240.818, 240.727, 240.636, 240.545, 240.455,
		  240.364, 240.273, 240.182, 240.091, 240.000, 239.615, 239.231, 238.846, 238.462, 238.077, 237.692, 237.308,
		  236.923, 236.538, 236.154, 235.769, 235.385, 235.000, 232.615, 230.231, 227.846, 225.462, 223.077, 220.692,
		  218.308, 215.923, 213.538, 211.154, 208.769, 206.385, 204.000, 200.077, 196.154, 192.231, 188.308, 184.385,
		  180.462, 176.538, 172.615, 168.692, 164.769, 160.846, 156.923, 153.000, 147.115, 141.231, 135.346, 129.462,
		  123.577, 117.692, 111.808, 105.923, 100.038, 94.1538, 88.2692, 82.3846, 76.5000, 73.0769, 69.6538, 66.2308,
		  62.8077, 59.3846, 55.9615, 52.5385, 49.1154, 45.6923, 42.2692, 38.8462, 35.4231, 32.0000, 29.5385, 27.0769,
		  24.6154, 22.1538, 19.6923, 17.2308, 14.7692, 12.3077, 9.84615, 7.38462, 4.92308, 2.46154, 0.00000, 9.80769,
		  19.6154, 29.4231, 39.2308, 49.0385, 58.8462, 68.6538, 78.4615, 88.2692, 98.0769, 107.885, 117.692, 127.500,
		  131.423, 135.346, 139.269, 143.192, 147.115, 151.038, 154.962, 158.885, 162.808, 166.731, 170.654, 174.577,
		  178.500, 180.462, 182.423, 184.385, 186.346, 188.308, 190.269, 192.231, 194.192, 196.154, 198.115, 200.077,
		  202.038, 204.000, 205.962, 207.923, 209.885, 211.846, 213.808, 215.769, 217.731, 219.692, 221.654, 223.615,
		  225.577, 227.538, 229.500, 230.481, 231.462, 232.442, 233.423, 234.404, 235.385, 236.365, 237.346, 238.327,
		  239.308, 240.288, 241.269, 242.250, 242.642, 243.035, 243.427, 243.819, 244.212, 244.604, 244.996, 245.388,
		  245.781, 246.173, 246.565, 246.958, 247.350, 247.814, 248.277, 248.741, 249.205, 249.668, 250.132, 250.595,
		  251.059, 251.523, 251.986, 252.450);
		  planck.b = float[256](255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000,
		  255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000,
		  255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000, 255.000,
		  255.000, 255.000, 255.000, 255.000, 254.615, 254.231, 253.846, 253.462, 253.077, 252.692, 252.308, 251.923,
		  251.538, 251.154, 250.769, 250.385, 250.000, 249.615, 249.231, 248.846, 248.462, 248.077, 247.692, 247.308,
		  246.923, 246.538, 246.154, 245.769, 245.385, 245.000, 242.000, 239.000, 236.000, 233.000, 230.000, 227.000,
		  224.000, 221.000, 218.000, 215.000, 212.000, 212.000, 208.636, 205.273, 201.909, 198.545, 195.182, 191.818,
		  188.455, 185.091, 181.727, 178.364, 175.000, 171.538, 168.077, 164.615, 161.154, 157.692, 154.231, 150.769,
		  147.308, 143.846, 140.385, 136.923, 133.462, 130.000, 122.942, 115.885, 108.827, 101.769, 94.7115, 87.6539,
		  80.5962, 73.5385, 66.4808, 59.4231, 52.3654, 45.3077, 38.2500, 36.2885, 34.3269, 32.3654, 30.4038, 28.4423,
		  26.4808, 24.5192, 22.5577, 20.5962, 18.6346, 16.6731, 14.7115, 12.7500, 11.7692, 10.7885, 9.80769, 8.82692,
		  7.84615, 6.86539, 5.88461, 4.90385, 3.92308, 2.94231, 1.96154, 0.980769, 0.00000, 2.46154, 4.92308, 7.38462,
		  9.84616, 12.3077, 14.7692, 17.2308, 19.6923, 22.1538, 24.6154, 27.0769, 29.5385, 32.0000, 32.0000, 32.0000,
		  32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 32.0000, 41.3077,
		  50.6154, 59.9231, 69.2308, 78.5385, 87.8462, 97.1539, 106.462, 115.769, 125.077, 134.385, 143.692, 153.000,
		  156.923, 160.846, 164.769, 168.692, 172.615, 176.538, 180.462, 184.385, 188.308, 192.231, 196.154, 200.077,
		  204.000, 205.962, 207.923, 209.885, 211.846, 213.808, 215.769, 217.731, 219.692, 221.654, 223.615, 225.577,
		  227.538, 229.500, 230.481, 231.462, 232.442, 233.423, 234.404, 235.385, 236.365, 237.346, 238.327, 239.308,
		  240.288, 241.269, 242.250, 242.838, 243.427, 244.015, 244.604, 245.192, 245.781, 246.369, 246.958, 247.546,
		  248.135, 248.723, 249.312, 249.900, 250.096, 250.292, 250.488, 250.685, 250.881, 251.077, 251.273, 251.469,
		  251.665, 251.862, 252.058, 252.254, 252.450, 252.682, 252.914, 253.145, 253.377, 253.609, 253.841, 254.073,
		  254.305, 254.536, 254.768, 255.000);
		  return planck;
	  }
  
		void main() {
		  vec3 finalColor;
  
			  if (uFactor0 >= 0.0){
				  vec4 mycolor;
				  #if __VERSION__ > 120
					  vec4 color0 = texture(uSampler0, vTextureCoord);
				  #else
					  vec4 color0 = texture2D(uSampler0, vTextureCoord);
				  #endif
				  colormap t;
				  t =  planckCMap();
				  int x = int(floor(color0.x * 256.0));
				  float px = t.r[x]/256.0;
				  int y = int(floor(color0.y * 256.0));
				  float py = t.g[y]/256.0;
				  int z = int(floor(color0.z * 256.0));
				  float pz = t.b[z]/256.0;
				  mycolor = vec4(px, py, pz, 1.0);
   
				  finalColor = vec3(finalColor.x +  mycolor.x *uFactor0 ,finalColor.y +  mycolor.y*uFactor0,finalColor.z +  mycolor.z*uFactor0); 
				  
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

	static hipsCmbFS() {
		return `#version 300 es
		precision mediump float;
  
	  //varying vec2 vTextureCoord;
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
  
	  /* 
	  0 -> native
	  1 -> planck
	  2 -> cmb
	  3 -> grayscale
	  4 -> rainbow
	  5 -> eosb
	  6 -> cubehelix
	  */
	  uniform int cmapIdx;
  
	  uniform float uSphericalGrid;
  
	  out vec4 fragColor;
	  
	  struct colormap {
		float r[256] ;
		float g[256];
		float b[256];
	} cmb;

	  colormap cmbCMap() {
		cmb.r = float[256](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 12.0,  18.0,  24.0,  30.0,  36.0,  42.0,  48.0,  54.0,  60.0, 66.0, 72.0, 78.0, 85.0, 91.0, 97.0, 103.0, 109.0, 115.0, 121.0, 127.0, 133.0, 139.0, 145.0, 151.0, 157.0, 163.0, 170.0, 176.0, 182.0, 188.0, 194.0, 200.0, 206.0, 212.0, 218.0, 224.0, 230.0, 236.0, 242.0, 248.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 251.0, 247.0, 244.0, 240.0, 236.0, 233.0, 229.0, 226.0, 222.0, 218.0, 215.0, 211.0, 208.0, 204.0, 200.0, 197.0, 193.0, 190.0, 186.0, 182.0, 179.0, 175.0, 172.0, 168.0, 164.0, 161.0, 157.0, 154.0, 150.0, 146.0, 143.0, 139.0,136.0, 132.0, 128.0, 125.0, 121.0, 118.0, 114.0, 110.0, 107.0, 103.0, 100.0);
		cmb.g = float[256](0.0, 2.0, 5.0, 8.0, 10.0, 13.0, 16.0, 18.0, 21.0, 24.0, 26.0, 29.0, 32.0, 34.0, 37.0, 40.0, 42.0, 45.0, 48.0, 50.0, 53.0, 56.0, 58.0, 61.0, 64.0, 66.0, 69.0, 72.0, 74.0, 77.0, 80.0, 82.0, 85.0, 88.0, 90.0, 93.0, 96.0, 98.0, 101.0, 104.0, 106.0, 109.0, 112.0, 114.0, 117.0, 119.0, 122.0, 124.0, 127.0,129.0, 132.0, 134.0, 137.0, 139.0, 142.0, 144.0, 147.0, 150.0, 152.0, 155.0, 157.0, 160.0, 162.0, 165.0, 167.0, 170.0, 172.0, 175.0, 177.0, 180.0, 182.0, 185.0, 188.0, 190.0, 193.0, 195.0, 198.0, 200.0, 203.0, 205.0, 208.0, 210.0, 213.0, 215.0, 218.0, 221.0, 221.0, 221.0, 222.0, 222.0, 222.0, 223.0, 223.0, 224.0, 224.0, 224.0, 225.0, 225.0, 225.0, 226.0, 226.0, 227.0, 227.0, 227.0, 228.0, 228.0, 229.0, 229.0, 229.0, 230.0, 230.0, 230.0, 231.0, 231.0, 232.0, 232.0, 232.0, 233.0, 233.0, 233.0, 234.0, 234.0, 235.0, 235.0, 235.0, 236.0, 236.0, 237.0, 235.0, 234.0, 233.0, 231.0, 230.0, 229.0, 227.0, 226.0, 225.0, 223.0, 222.0, 221.0, 219.0, 218.0, 217.0, 215.0, 214.0, 213.0, 211.0,210.0, 209.0, 207.0, 206.0, 205.0, 203.0, 202.0, 201.0, 199.0, 198.0, 197.0, 195.0, 194.0, 193.0, 191.0, 190.0, 189.0, 187.0, 186.0, 185.0, 183.0, 182.0, 181.0, 180.0, 177.0, 175.0, 172.0, 170.0, 167.0, 165.0, 162.0, 160.0, 157.0, 155.0, 152.0, 150.0, 147.0, 145.0, 142.0, 140.0, 137.0, 135.0, 132.0, 130.0, 127.0, 125.0, 122.0, 120.0, 117.0, 115.0, 112.0, 110.0, 107.0, 105.0, 102.0, 100.0, 97.0, 95.0, 92.0, 90.0, 87.0, 85.0, 82.0, 80.0, 77.0, 75.0, 73.0, 71.0, 69.0, 68.0, 66.0, 64.0, 62.0, 61.0, 59.0, 57.0, 55.0, 54.0, 52.0, 50.0, 48.0, 47.0, 45.0, 43.0, 41.0, 40.0, 38.0, 36.0, 34.0, 33.0, 31.0, 29.0, 27.0, 26.0, 24.0, 22.0, 20.0, 19.0,17.0, 15.0, 13.0, 12.0, 10.0, 8.0, 6.0, 5.0, 3.0, 1.0, 0.0);
		cmb.b = float[256](255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 254.0, 253.0, 252.0, 251.0, 250.0, 249.0, 248.0, 247.0, 246.0, 245.0, 245.0, 244.0,243.0, 242.0, 241.0, 240.0, 239.0, 238.0, 237.0, 236.0, 236.0, 235.0, 234.0, 233.0, 232.0, 231.0, 230.0, 229.0, 228.0, 227.0, 226.0, 226.0, 225.0, 224.0, 223.0, 222.0, 221.0, 220.0, 219.0, 218.0, 217.0, 217.0, 211.0, 206.0, 201.0, 196.0, 191.0, 186.0, 181.0, 176.0, 171.0, 166.0, 161.0, 156.0, 151.0, 146.0, 141.0, 136.0, 131.0, 126.0, 121.0,116.0, 111.0, 105.0, 100.0, 95.0, 90.0, 85.0, 80.0, 75.0, 70.0, 65.0, 60.0, 55.0, 50.0, 45.0, 40.0, 35.0, 30.0, 25.0, 20.0, 15.0, 10.0, 5.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

		return cmb;
	}
	void main() {
		vec3 finalColor;

			if (uFactor0 >= 0.0){
				vec4 mycolor;
				#if __VERSION__ > 120
					vec4 color0 = texture(uSampler0, vTextureCoord);
				#else
					vec4 color0 = texture2D(uSampler0, vTextureCoord);
				#endif
				colormap t;
				t =  cmbCMap();
				int x = int(floor(color0.x * 256.0));
				float px = t.r[x]/256.0;
				int y = int(floor(color0.y * 256.0));
				float py = t.g[y]/256.0;
				int z = int(floor(color0.z * 256.0));
				float pz = t.b[z]/256.0;
				mycolor = vec4(px, py, pz, 1.0);
 
				finalColor = vec3(finalColor.x +  mycolor.x *uFactor0 ,finalColor.y +  mycolor.y*uFactor0,finalColor.z +  mycolor.z*uFactor0); 

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
	  }`;
	}



	static hipsRainbowFS() {
		return `#version 300 es
		precision mediump float;
  
	  //varying vec2 vTextureCoord;
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
  
	  uniform int cmapIdx;
  
	  uniform float uSphericalGrid;
  
	  out vec4 fragColor;
	  
	  struct colormap {
		float r[256] ;
		float g[256];
		float b[256];
	} rainbow;

	  colormap rainbowCMap() {
		rainbow.r = float[256](0.0, 4.0, 9.0, 13.0, 18.0, 22.0, 27.0, 31.0, 36.0, 40.0, 45.0, 50.0, 54.0,
        58.0, 61.0, 64.0, 68.0, 69.0, 72.0, 74.0, 77.0, 79.0, 80.0, 82.0, 83.0, 85.0, 84.0, 86.0, 87.0, 88.0, 86.0, 87.0, 87.0, 87.0, 85.0, 84.0, 84.0,
        84.0, 83.0, 79.0, 78.0, 77.0, 76.0, 71.0, 70.0, 68.0, 66.0, 60.0, 58.0, 55.0, 53.0, 46.0, 43.0, 40.0, 36.0, 33.0, 25.0, 21.0, 16.0, 12.0, 4.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 8.0, 12.0, 21.0, 25.0, 29.0, 33.0, 42.0,
        46.0, 51.0, 55.0, 63.0, 67.0, 72.0, 76.0, 80.0, 89.0, 93.0, 97.0, 101.0, 110.0, 114.0, 119.0, 123.0, 131.0, 135.0, 140.0, 144.0, 153.0,
        157.0, 161.0, 165.0, 169.0, 178.0, 182.0, 187.0, 191.0, 199.0, 203.0, 208.0, 212.0, 221.0, 225.0, 229.0, 233.0, 242.0, 246.0,
        250.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0);
		rainbow.g = float[256](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.0, 8.0, 16.0, 21.0, 25.0, 29.0, 38.0, 42.0, 46.0, 51.0, 55.0, 63.0, 67.0, 72.0, 76.0, 84.0, 89.0, 93.0, 97.0,
        106.0, 110.0, 114.0, 119.0, 127.0, 131.0, 135.0, 140.0, 144.0, 152.0, 157.0, 161.0, 165.0, 174.0, 178.0, 182.0, 187.0, 195.0,
        199.0, 203.0, 208.0, 216.0, 220.0, 225.0, 229.0, 233.0, 242.0, 246.0, 250.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 250.0, 242.0, 238.0, 233.0, 229.0, 221.0, 216.0, 212.0, 208.0, 199.0, 195.0, 191.0, 187.0, 178.0, 174.0, 170.0, 165.0,
        161.0, 153.0, 148.0, 144.0, 140.0, 131.0, 127.0, 123.0, 119.0, 110.0, 106.0, 102.0, 97.0, 89.0, 85.0, 80.0, 76.0, 72.0, 63.0, 59.0,
        55.0, 51.0, 42.0, 38.0, 34.0, 29.0, 21.0, 17.0, 12.0, 8.0, 0.0);
		rainbow.b = float[256](0.0, 3.0, 7.0, 10.0, 14.0, 19.0, 23.0, 28.0, 32.0, 38.0, 43.0, 48.0, 53.0,
        59.0, 63.0, 68.0, 72.0, 77.0, 81.0, 86.0, 91.0, 95.0, 100.0, 104.0, 109.0, 113.0, 118.0, 122.0, 127.0, 132.0, 136.0, 141.0, 145.0,
        150.0, 154.0, 159.0, 163.0, 168.0, 173.0, 177.0, 182.0, 186.0, 191.0, 195.0, 200.0, 204.0, 209.0, 214.0, 218.0, 223.0, 227.0,
        232.0, 236.0, 241.0, 245.0, 250.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 246.0, 242.0, 238.0, 233.0, 225.0, 220.0, 216.0, 212.0, 203.0, 199.0, 195.0, 191.0,
        187.0, 178.0, 174.0, 170.0, 165.0, 157.0, 152.0, 148.0, 144.0, 135.0, 131.0, 127.0, 123.0, 114.0, 110.0, 106.0, 102.0, 97.0,
        89.0, 84.0, 80.0, 76.0, 67.0, 63.0, 59.0, 55.0, 46.0, 42.0, 38.0, 34.0, 25.0, 21.0, 16.0, 12.0, 8.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
		return rainbow;
	}
	void main() {
		vec3 finalColor;

			if (uFactor0 >= 0.0){
				vec4 mycolor;
				#if __VERSION__ > 120
					vec4 color0 = texture(uSampler0, vTextureCoord);
				#else
					vec4 color0 = texture2D(uSampler0, vTextureCoord);
				#endif
				colormap t;
				t =  rainbowCMap();
				int x = int(floor(color0.x * 256.0));
				float px = t.r[x]/256.0;
				int y = int(floor(color0.y * 256.0));
				float py = t.g[y]/256.0;
				int z = int(floor(color0.z * 256.0));
				float pz = t.b[z]/256.0;
				mycolor = vec4(px, py, pz, 1.0);
 
				finalColor = vec3(finalColor.x +  mycolor.x *uFactor0 ,finalColor.y +  mycolor.y*uFactor0,finalColor.z +  mycolor.z*uFactor0); 
				
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
	  }`;
	}


	static hipsEosbFS() {
		return `#version 300 es
		precision mediump float;
  
	  //varying vec2 vTextureCoord;
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
  
	  uniform int cmapIdx;
  
	  uniform float uSphericalGrid;
  
	  out vec4 fragColor;
	  
	  struct colormap {
		float r[256] ;
		float g[256];
		float b[256];
	} eosb;

	colormap eosbCMap() {
		eosb.r = float[256](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 9.0, 18.0, 27.0, 36.0, 45.0, 49.0, 57.0, 72.0, 81.0, 91.0, 100.0, 109.0, 118.0, 127.0,
        136.0, 131.0, 139.0, 163.0, 173.0, 182.0, 191.0, 200.0, 209.0, 218.0, 227.0, 213.0, 221.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 255.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0,
        255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0,
        229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0,
        255.0, 229.0, 229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 253.0, 251.0, 249.0, 247.0,
        245.0, 243.0, 241.0, 215.0, 214.0, 235.0, 234.0, 232.0, 230.0, 228.0, 226.0, 224.0, 222.0, 198.0, 196.0, 216.0, 215.0, 213.0,
        211.0, 209.0, 207.0, 205.0, 203.0, 181.0, 179.0, 197.0, 196.0, 194.0, 192.0, 190.0, 188.0, 186.0, 184.0, 164.0, 162.0, 178.0,
        176.0, 175.0, 173.0, 171.0, 169.0, 167.0, 165.0, 147.0, 145.0, 159.0, 157.0, 156.0, 154.0, 152.0, 150.0, 148.0, 146.0, 130.0,
        128.0, 140.0, 138.0, 137.0, 135.0, 133.0, 131.0, 129.0, 127.0, 113.0, 111.0, 121.0, 119.0, 117.0, 117.0);
		eosb.g = float[256](0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 7.0, 15.0, 23.0, 31.0, 39.0, 47.0, 55.0, 57.0, 64.0, 79.0, 87.0, 95.0,
        103.0, 111.0, 119.0, 127.0, 135.0, 129.0, 136.0, 159.0, 167.0, 175.0, 183.0, 191.0, 199.0, 207.0, 215.0, 200.0, 207.0, 239.0,
        247.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0,
        229.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 255.0, 229.0, 229.0, 255.0, 250.0, 246.0, 242.0, 238.0, 233.0, 229.0,
        225.0, 198.0, 195.0, 212.0, 208.0, 204.0, 199.0, 195.0, 191.0, 187.0, 182.0, 160.0, 156.0, 169.0, 165.0, 161.0, 157.0, 153.0,
        148.0, 144.0, 140.0, 122.0, 118.0, 127.0, 125.0, 123.0, 121.0, 119.0, 116.0, 114.0, 112.0, 99.0, 97.0, 106.0, 104.0, 102.0,
        99.0, 97.0, 95.0, 93.0, 91.0, 80.0, 78.0, 84.0, 82.0, 80.0, 78.0, 76.0, 74.0, 72.0, 70.0, 61.0, 59.0, 63.0, 61.0, 59.0, 57.0, 55.0, 53.0, 50.0,
        48.0, 42.0, 40.0, 42.0, 40.0, 38.0, 36.0, 33.0, 31.0, 29.0, 27.0, 22.0, 21.0, 21.0, 19.0, 16.0, 14.0, 12.0, 13.0, 8.0, 6.0, 3.0, 1.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
		eosb.b = float[256](116.0, 121.0, 127.0, 131.0, 136.0, 140.0, 144.0, 148.0, 153.0,
        157.0, 145.0, 149.0, 170.0, 174.0, 178.0, 182.0, 187.0, 191.0, 195.0, 199.0, 183.0, 187.0, 212.0, 216.0, 221.0, 225.0, 229.0,
        233.0, 238.0, 242.0, 221.0, 225.0, 255.0, 247.0, 239.0, 231.0, 223.0, 215.0, 207.0, 199.0, 172.0, 164.0, 175.0, 167.0, 159.0,
        151.0, 143.0, 135.0, 127.0, 119.0, 100.0, 93.0, 95.0, 87.0, 79.0, 71.0, 63.0, 55.0, 47.0, 39.0, 28.0, 21.0, 15.0, 7.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
		return eosb;
	}
	void main() {
		vec3 finalColor;

			if (uFactor0 >= 0.0){
				vec4 mycolor;
				#if __VERSION__ > 120
					vec4 color0 = texture(uSampler0, vTextureCoord);
				#else
					vec4 color0 = texture2D(uSampler0, vTextureCoord);
				#endif
				colormap t;
				t =  eosbCMap();
				int x = int(floor(color0.x * 256.0));
				float px = t.r[x]/256.0;
				int y = int(floor(color0.y * 256.0));
				float py = t.g[y]/256.0;
				int z = int(floor(color0.z * 256.0));
				float pz = t.b[z]/256.0;
				mycolor = vec4(px, py, pz, 1.0);
 
				finalColor = vec3(finalColor.x +  mycolor.x *uFactor0 ,finalColor.y +  mycolor.y*uFactor0,finalColor.z +  mycolor.z*uFactor0); 
				
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
	  }`;
	}



	static hipsCubehelixFS() {
		return `#version 300 es
		precision mediump float;
  
	  //varying vec2 vTextureCoord;
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
  
	  uniform int cmapIdx;
  
	  uniform float uSphericalGrid;
  
	  out vec4 fragColor;
	  
	  struct colormap {
		float r[256] ;
		float g[256];
		float b[256];
	} cubehelix;

	colormap cubehelixCMap() {
		cubehelix.r = float[256](0.0, 1.0, 3.0, 4.0, 6.0, 8.0, 9.0, 10.0, 12.0, 13.0, 14.0, 15.0, 17.0, 18.0,
        19.0, 20.0, 20.0, 21.0, 22.0, 23.0, 23.0, 24.0, 24.0, 25.0, 25.0, 25.0, 26.0, 26.0, 26.0, 26.0, 26.0, 26.0, 26.0, 26.0, 26.0, 26.0, 26.0, 25.0,
        25.0, 25.0, 25.0, 24.0, 24.0, 24.0, 23.0, 23.0, 23.0, 23.0, 22.0, 22.0, 22.0, 21.0, 21.0, 21.0, 21.0, 21.0, 21.0, 20.0, 20.0, 20.0, 21.0, 21.0,
        21.0, 21.0, 21.0, 22.0, 22.0, 22.0, 23.0, 23.0, 24.0, 25.0, 26.0, 27.0, 27.0, 28.0, 30.0, 31.0, 32.0, 33.0, 35.0, 36.0, 38.0, 39.0, 41.0, 43.0,
        45.0, 47.0, 49.0, 51.0, 53.0, 55.0, 57.0, 60.0, 62.0, 65.0, 67.0, 70.0, 72.0, 75.0, 78.0, 81.0, 83.0, 86.0, 89.0, 92.0, 95.0, 98.0, 101.0, 104.0,
        107.0, 110.0, 113.0, 116.0, 120.0, 123.0, 126.0, 129.0, 132.0, 135.0, 138.0, 141.0, 144.0, 147.0, 150.0, 153.0, 155.0, 158.0,
        161.0, 164.0, 166.0, 169.0, 171.0, 174.0, 176.0, 178.0, 181.0, 183.0, 185.0, 187.0, 189.0, 191.0, 193.0, 194.0, 196.0, 198.0,
        199.0, 201.0, 202.0, 203.0, 204.0, 205.0, 206.0, 207.0, 208.0, 209.0, 209.0, 210.0, 211.0, 211.0, 211.0, 212.0, 212.0, 212.0,
        212.0, 212.0, 212.0, 212.0, 212.0, 211.0, 211.0, 211.0, 210.0, 210.0, 210.0, 209.0, 208.0, 208.0, 207.0, 207.0, 206.0, 205.0,
        205.0, 204.0, 203.0, 203.0, 202.0, 201.0, 201.0, 200.0, 199.0, 199.0, 198.0, 197.0, 197.0, 196.0, 196.0, 195.0, 195.0, 194.0,
        194.0, 194.0, 193.0, 193.0, 193.0, 193.0, 193.0, 193.0, 193.0, 193.0, 193.0, 193.0, 194.0, 194.0, 195.0, 195.0, 196.0, 196.0,
        197.0, 198.0, 199.0, 200.0, 200.0, 202.0, 203.0, 204.0, 205.0, 206.0, 208.0, 209.0, 210.0, 212.0, 213.0, 215.0, 217.0, 218.0,
        220.0, 222.0, 223.0, 225.0, 227.0, 229.0, 231.0, 232.0, 234.0, 236.0, 238.0, 240.0, 242.0, 244.0, 245.0, 247.0, 249.0, 251.0,
        253.0, 255.0);
		cubehelix.g = float[256](0.0, 0.0, 1.0, 1.0, 2.0, 2.0, 3.0, 4.0, 4.0, 5.0, 6.0, 6.0, 7.0, 8.0, 9.0, 10.0,
        11.0, 11.0, 12.0, 13.0, 14.0, 15.0, 17.0, 18.0, 19.0, 20.0, 21.0, 22.0, 24.0, 25.0, 26.0, 28.0, 29.0, 31.0, 32.0, 34.0, 35.0, 37.0, 38.0, 40.0,
        41.0, 43.0, 45.0, 46.0, 48.0, 50.0, 52.0, 53.0, 55.0, 57.0, 58.0, 60.0, 62.0, 64.0, 66.0, 67.0, 69.0, 71.0, 73.0, 74.0, 76.0, 78.0, 79.0, 81.0,
        83.0, 84.0, 86.0, 88.0, 89.0, 91.0, 92.0, 94.0, 95.0, 97.0, 98.0, 99.0, 101.0, 102.0, 103.0, 104.0, 106.0, 107.0, 108.0, 109.0, 110.0,
        111.0, 112.0, 113.0, 114.0, 114.0, 115.0, 116.0, 116.0, 117.0, 118.0, 118.0, 119.0, 119.0, 120.0, 120.0, 120.0, 121.0, 121.0,
        121.0, 121.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 122.0, 121.0,
        121.0, 121.0, 121.0, 121.0, 121.0, 121.0, 121.0, 121.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0, 120.0,
        121.0, 121.0, 121.0, 121.0, 121.0, 122.0, 122.0, 122.0, 123.0, 123.0, 124.0, 124.0, 125.0, 125.0, 126.0, 127.0, 127.0, 128.0,
        129.0, 130.0, 131.0, 131.0, 132.0, 133.0, 135.0, 136.0, 137.0, 138.0, 139.0, 140.0, 142.0, 143.0, 144.0, 146.0, 147.0, 149.0,
        150.0, 152.0, 154.0, 155.0, 157.0, 158.0, 160.0, 162.0, 164.0, 165.0, 167.0, 169.0, 171.0, 172.0, 174.0, 176.0, 178.0, 180.0,
        182.0, 183.0, 185.0, 187.0, 189.0, 191.0, 193.0, 194.0, 196.0, 198.0, 200.0, 202.0, 203.0, 205.0, 207.0, 208.0, 210.0, 212.0,
        213.0, 215.0, 216.0, 218.0, 219.0, 221.0, 222.0, 224.0, 225.0, 226.0, 228.0, 229.0, 230.0, 231.0, 232.0, 233.0, 235.0, 236.0,
        237.0, 238.0, 239.0, 240.0, 240.0, 241.0, 242.0, 243.0, 244.0, 244.0, 245.0, 246.0, 247.0, 247.0, 248.0, 248.0, 249.0, 250.0,
        250.0, 251.0, 251.0, 252.0, 252.0, 253.0, 253.0, 254.0, 255.0);
		cubehelix.b = float[256](0.0, 1.0, 3.0, 4.0, 6.0, 8.0, 9.0, 11.0, 13.0, 15.0, 17.0, 19.0, 21.0, 23.0,
        25.0, 27.0, 29.0, 31.0, 33.0, 35.0, 37.0, 39.0, 41.0, 43.0, 45.0, 47.0, 48.0, 50.0, 52.0, 54.0, 56.0, 57.0, 59.0, 60.0, 62.0, 63.0, 65.0, 66.0,
        67.0, 69.0, 70.0, 71.0, 72.0, 73.0, 74.0, 74.0, 75.0, 76.0, 76.0, 77.0, 77.0, 77.0, 78.0, 78.0, 78.0, 78.0, 78.0, 78.0, 78.0, 77.0, 77.0, 77.0,
        76.0, 76.0, 75.0, 75.0, 74.0, 73.0, 73.0, 72.0, 71.0, 70.0, 69.0, 68.0, 67.0, 66.0, 66.0, 65.0, 64.0, 63.0, 61.0, 60.0, 59.0, 58.0, 58.0, 57.0,
        56.0, 55.0, 54.0, 53.0, 52.0, 51.0, 51.0, 50.0, 49.0, 49.0, 48.0, 48.0, 47.0, 47.0, 47.0, 46.0, 46.0, 46.0, 46.0, 46.0, 47.0, 47.0, 47.0, 48.0,
        48.0, 49.0, 50.0, 50.0, 51.0, 52.0, 53.0, 55.0, 56.0, 57.0, 59.0, 60.0, 62.0, 64.0, 65.0, 67.0, 69.0, 71.0, 74.0, 76.0, 78.0, 81.0, 83.0, 86.0,
        88.0, 91.0, 94.0, 96.0, 99.0, 102.0, 105.0, 108.0, 111.0, 114.0, 117.0, 120.0, 124.0, 127.0, 130.0, 133.0, 136.0, 140.0, 143.0,
        146.0, 149.0, 153.0, 156.0, 159.0, 162.0, 165.0, 169.0, 172.0, 175.0, 178.0, 181.0, 184.0, 186.0, 189.0, 192.0, 195.0, 197.0,
        200.0, 203.0, 205.0, 207.0, 210.0, 212.0, 214.0, 216.0, 218.0, 220.0, 222.0, 224.0, 226.0, 227.0, 229.0, 230.0, 231.0, 233.0,
        234.0, 235.0, 236.0, 237.0, 238.0, 239.0, 239.0, 240.0, 241.0, 241.0, 242.0, 242.0, 242.0, 243.0, 243.0, 243.0, 243.0, 243.0,
        243.0, 243.0, 243.0, 243.0, 243.0, 242.0, 242.0, 242.0, 242.0, 241.0, 241.0, 241.0, 241.0, 240.0, 240.0, 240.0, 239.0, 239.0,
        239.0, 239.0, 239.0, 238.0, 238.0, 238.0, 238.0, 238.0, 238.0, 238.0, 238.0, 239.0, 239.0, 239.0, 240.0, 240.0, 240.0, 241.0,
        242.0, 242.0, 243.0, 244.0, 245.0, 246.0, 247.0, 248.0, 249.0, 250.0, 252.0, 253.0, 255.0);
		return cubehelix;
	}
	void main() {
		vec3 finalColor;

			if (uFactor0 >= 0.0){
				vec4 mycolor;
				#if __VERSION__ > 120
					vec4 color0 = texture(uSampler0, vTextureCoord);
				#else
					vec4 color0 = texture2D(uSampler0, vTextureCoord);
				#endif
				colormap t;
				t =  cubehelixCMap();
				int x = int(floor(color0.x * 256.0));
				float px = t.r[x]/256.0;
				int y = int(floor(color0.y * 256.0));
				float py = t.g[y]/256.0;
				int z = int(floor(color0.z * 256.0));
				float pz = t.b[z]/256.0;
				mycolor = vec4(px, py, pz, 1.0);
 
				finalColor = vec3(finalColor.x +  mycolor.x *uFactor0 ,finalColor.y +  mycolor.y*uFactor0,finalColor.z +  mycolor.z*uFactor0); 
				
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
	  }`;
	}

}

export default ShaderManagerMutliHiPS;