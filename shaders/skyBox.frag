precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexSky;

void main(void) {

    gl_FragColor = texture2D(uTexSky, vec2(vTexCoord.s, vTexCoord.t));
    //gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a);
	//gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0);
	
}
