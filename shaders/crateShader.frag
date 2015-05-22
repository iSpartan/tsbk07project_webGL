    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec3 vTransformedNormal;
    varying vec4 vPosition;

    uniform vec3 uPointLightingLocation;
    uniform sampler2D uSampler;
    uniform sampler2D bumpMap;

#extension GL_OES_standard_derivatives : enable

vec3 getNormal() {
    // Differentiate the position vector
    vec3 dPositiondx = dFdx(vPosition).rgb;
    vec3 dPositiondy = dFdy(vPosition).rgb;
    vec2 st = vPosition.xy / 65536.0;
    float depth = texture2D(bumpMap, st).a;
    float dDepthdx = dFdx(depth);
    float dDepthdy = dFdy(depth);
    vec3 normal = normalize(vTransformedNormal);
    dPositiondx -= 10.0 * dDepthdx * normal;
    dPositiondy -= 10.0 * dDepthdy * normal;

    // The normal is the cross product of the differentials
    return normalize(cross(dPositiondx, dPositiondy));
}

    void main(void) {
        vec3 lightWeighting;
        bool showSpecularHighlights = true;
        bool useLighting = true;


        if (!useLighting) {
            lightWeighting = vec3(1.0, 1.0, 1.0);
        } else {
            vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);
            vec3 normal = getNormal();


            float specularLightWeighting = 0.0;
            if (showSpecularHighlights) {
                vec3 eyeDirection = normalize(-vPosition.xyz);
                vec3 reflectionDirection = reflect(-lightDirection, normal);

                specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 32.0);
            }

            float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
            lightWeighting = vec3(0.1, 0.1, 0.1)
                + vec3(0.8, 0.8, 0.8) * specularLightWeighting
                + vec3(0.8, 0.8, 0.8) * diffuseLightWeighting;
        }

        vec4 fragmentColor;
        fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
    }