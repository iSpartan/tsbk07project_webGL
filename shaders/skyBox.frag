precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexSky;

void main(void) {

    gl_FragColor = texture2D(uTexSky, vec2(vTexCoord.s, vTexCoord.t));
	
}
