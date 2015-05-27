    precision mediump float;

    varying vec3 lightSourceCoord;

    uniform sampler2D shadowTex;

#extension GL_OES_standard_derivatives : enable

float getShadow(){

    vec2 shadowMap = lightSourceCoord.xy;

    vec4 shadowColor = texture2D(shadowTex, shadowMap);
    float shw = shadowColor.r + 0.000;
    //float shadowCoeff=1.-smoothstep(0.002, 0.003, lightSourceCoord.z-shw);
    float shadow = 1.0;
    if (shw < lightSourceCoord.z)
        shadow = 0.3;
    return shadow;
}

    void main(void) {

        vec4 clr = vec4(1.0, 1.0, 1.0, 1.0);

        float shadow = getShadow();

        gl_FragColor = vec4(clr.r, clr.g, shadow, clr.a);
        //gl_FragColor = clr * shadow;
        //gl_FragColor = clr;
    }