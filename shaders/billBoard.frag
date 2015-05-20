precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexBill;

void main(void) {

        //gl_FragColor = texture2D(uTexBill, vec2(vTexCoord.s, vTexCoord.t));
		gl_FragColor = vec4(0.5,1.0,1.0,1.0);
		}