    precision mediump float;

    //varying vec3 vTransformedNormal;
    varying vec3 vColorAttrib;

    void main(void) {

        //vec3 lightWeighting = vec3(1.0, 1.0, 1.0);
    	//vec3 normal = normalize(vTransformedNormal);
    	//vec4 fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
    	//float strength = max(dot(normal, lightWeighting), 0.0);
        //gl_FragColor = vec4(vColorAttrib * lightWeighting * strength, 1.0);
        gl_FragColor = vec4(vColorAttrib, 1.0);
        //gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }