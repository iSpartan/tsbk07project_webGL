    precision mediump float;

    varying vec4 lightSourceCoord;

    uniform sampler2D shadowTex;

#extension GL_OES_standard_derivatives : enable

float getShadow(){
    vec3 lightPosDNC=lightSourceCoord.xyz/lightSourceCoord.w;

    vec2 uv_shadowMap=lightPosDNC.xy;
    vec4 shadowMapColor=texture2D(shadowTex, uv_shadowMap);
    float zShadowMap=shadowMapColor.r;
    float shadow = 1.0;
    if (zShadowMap+0.0022<lightPosDNC.z){
        shadow = 0.3;
    }
    return shadow;

    //vec4 shadowCoordinateWdivide = lightSourceCoord / lightSourceCoord.w;
    //shadowCoordinateWdivide.z -= 0.002;

    //float distanceFromLight = texture2D(shadowTex, shadowCoordinateWdivide.st).x;
    //distanceFromLight = (distanceFromLight-0.5) * 2.0;
    //return shadowCoordinateWdivide.z;
    //float shadow = 1.0;
    //if (lightSourceCoord.w > 0.0) {
    //    if (distanceFromLight < shadowCoordinateWdivide.z){ // shadow
    //    shadow = 0.3;
    //    }
    //}
    //return shadow;
}

    void main(void) {

        vec4 clr = vec4(1.0);

        float shadow = getShadow();

        //gl_FragColor = vec4(shadow, 0.0, 0.0, clr.a);
        gl_FragColor = vec4(clr.rgb * shadow, clr.a);
        //gl_FragColor = clr;
    }