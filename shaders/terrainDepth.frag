    precision mediump float;

    varying vec4 vPosition;
    varying vec3 vTransformedNormal;
    varying vec3 vColorAttrib;
    varying vec4 lightSourceCoord;
    //varying vec2 vTextureCoord;

    uniform sampler2D shadowTex;
    uniform sampler2D uTexBump;
    uniform vec3 uPointLightingLocation;

#extension GL_OES_standard_derivatives : enable

float getShadow(){
    //vec3 lightPosDNC=lightSourceCoord.xyz/lightSourceCoord.w;

    //vec2 uv_shadowMap=lightPosDNC.xy;
    //vec4 shadowMapColor=texture2D(shadowTex, uv_shadowMap);
    //float zShadowMap=shadowMapColor.r;
    //if (zShadowMap+0.0022<lightPosDNC.z){
    //    return 0.3;
    //}
    //return 1.0;

    vec4 shadowCoordinateWdivide = lightSourceCoord / lightSourceCoord.w;
    shadowCoordinateWdivide.z -= 0.002;

    float distanceFromLight = texture2D(shadowTex, shadowCoordinateWdivide.st).x;
    distanceFromLight = (distanceFromLight-0.5) * 2.0;
    return shadowCoordinateWdivide.z;
    float shadow = 1.0;
    //if (lightSourceCoord.w > 0.0) {
        if (distanceFromLight < shadowCoordinateWdivide.z){ // shadow
        shadow = 0.3;
        }
    //}
    return shadow;
}

vec3 getNormal() {
    // Differentiate the position vector
    vec3 dPositiondx = dFdx(vPosition.rgb);
    vec3 dPositiondy = dFdy(vPosition.rgb);
    vec2 st = vPosition.xy / 256.0;
    float depth = texture2D(uTexBump, st).a;
    float dDepthdx = dFdx(depth);
    float dDepthdy = dFdy(depth);
    vec3 normal = normalize(vTransformedNormal);
    dPositiondx -= 10.0 * dDepthdx * normal;
    dPositiondy -= 10.0 * dDepthdy * normal;

    // The normal is the cross product of the differentials
    return normalize(cross(dPositiondx, dPositiondy));
}

    void main(void) {

        //float offset = 1.0 / 256.0; // texture size, same in both directions
        vec4 clr = vec4(vColorAttrib, 1.0);

        vec3 normal = getNormal();
        vec3 light = normalize(uPointLightingLocation - vPosition.xyz);

        // Mix in diffuse light
        float diffuse = dot(light, normal);
        diffuse = max(0.0, diffuse);
        vec4 dark = vec4(0, 0, 0, 1.0);
        vec4 color = mix(dark, clr, 0.1 + 0.9 * diffuse);

        float shadow = getShadow();

        //gl_FragColor = vec4(shadow, 0.0, 0.0, color.a);
        gl_FragColor = vec4(color.rgb * shadow, color.a);
        //gl_FragColor = color;
    }