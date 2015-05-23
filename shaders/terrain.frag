    precision mediump float;

    varying vec4 vPosition;
    varying vec3 vTransformedNormal;
    varying vec3 vColorAttrib;
    varying vec3 lightSourceCoord;
    //varying vec2 vTextureCoord;

    uniform sampler2D shadowTex;
    uniform sampler2D uTexBump;
    uniform vec3 uPointLightingLocation;

#extension GL_OES_standard_derivatives : enable

float getShadow(){
    vec2 shadowMap = lightSourceCoord.xy;
    
    // Look up the depth value
    vec4 shadowColor = texture2D(shadowTex, shadowMap);
    float shw = shadowColor.r * 1.01;

    float shadow = 1.0;

    if (shw < lightSourceCoord.z)
        shadow = 0.0;
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

        //gl_FragColor = vec4(shadow, shadow, shadow, color.a);
        gl_FragColor = color * shadow;
    }