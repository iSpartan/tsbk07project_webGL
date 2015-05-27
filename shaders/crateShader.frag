    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec3 vTransformedNormal;
    varying vec4 vPosition;

    uniform vec3 ulightSources[3];
    uniform sampler2D uSampler;
    uniform sampler2D bumpMap;
    uniform float uAmountOfLightSources;

#extension GL_OES_standard_derivatives : enable

vec3 getNormal() {
    // Differentiate the position vector
    vec3 dPositiondx = dFdx(vPosition.xyz);
    vec3 dPositiondy = dFdy(vPosition.xyz);
    float depth = texture2D(bumpMap, vTextureCoord).a;
    float dDepthdx = dFdx(depth);
    float dDepthdy = dFdy(depth);
    vec3 normal = normalize(vTransformedNormal);
    dPositiondx -= 10.0 * dDepthdx * normal;
    dPositiondy -= 10.0 * dDepthdy * normal;

    // The normal is the cross product of the differentials
    return normalize(cross(dPositiondx, dPositiondy));
}

vec3 getLightStrength(vec3 light, vec3 color){
    vec3 lightDirection = normalize(light - vPosition.xyz);
    float shade = 0.0;
    vec3 clr;
            //vec3 normal = getNormal();
            vec3 normal = normalize(vTransformedNormal);

            float diffuse = max(dot(normal, lightDirection), 0.0);

            vec3 eyeDirection = normalize(-vPosition.xyz);
            vec3 reflectionDirection = reflect(-lightDirection, normal);

            float tmp = dot(-lightDirection, normal);
            float specular = dot(reflectionDirection, eyeDirection);
            if (specular > 0.0 && tmp < 0.0){
                specular = 5.0 * pow(specular, 4.0);
                //specular = 300.0 * pow(specular, 8.0);
            }
            specular = max(specular, 0.0);

            shade = 0.7 * diffuse + 0.1 * specular + (0.2 / uAmountOfLightSources);
            //shade = 0.0 * diffuse + 0.0 * specular + (0.4 / uAmountOfLightSources);

            //clr = mix(dark, color, 0.1 + 0.9 * diffuse);
            //clr = mix(clr, lght, 0.5 * specular) / uAmountOfLightSources;
            clr = shade * color;
            return clr;
}

    void main(void) {
        vec4 fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        //vec4 fragmentColor = vec4(1.0, 1.0, 1.0 ,1.0);
        vec3 lightWeighting = vec3(0.0, 0.0, 0.0);

                int maxLoop = int(uAmountOfLightSources);

            for (int i = 0; i < 3; i++) {
                if(i >= maxLoop){
                    break;
                }
                lightWeighting += getLightStrength(ulightSources[i], fragmentColor.rgb);
            }
        gl_FragColor = vec4(lightWeighting, fragmentColor.a);
    }