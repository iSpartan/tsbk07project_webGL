    precision mediump float;

    varying vec2 vTextureCoord;

    uniform sampler2D uTexBump;

    void main(void) {

	gl_FragColor = texture2D(uTexBump, vec2(vTextureCoord.s, vTextureCoord.t));
       //gl_FragColor = vec4(0.5,1.0,1.0,1.0);
    }