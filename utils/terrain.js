/**
 * Class: Heightmap.
 *
 * Holds heightmap data and provides useful methods to access it.
 */
var Heightmap = (function () {

    /**
     * Constructor
     *
     * @param {Array} heightmap: A 1D array of numbers representing the heightmap.
     * @param {Number} width: The heightmaps width.
     * @param {Number} height: The heightmaps "height" in 2D.
     *   (When we think about it in 3D it's actually the depth)
     */
    function Heightmap(img, width, height, maxWidth, maxDepth) {
        this.heightmap = createHeightData(img, width, height);
        this.width = width;
        this.height = height;
        this.maxWidth = maxWidth;
        this.maxDepth = maxDepth;
        this.maxHeight = getMaxHeight(this.heightmap, width*height);
    };

    function createHeightData(img, width, height) {
    var canvas = document.createElement( 'canvas' );
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext( '2d' );

    var size = width * height * 4, heigthData = new Float32Array( width * height );

    context.drawImage(img,0,0);

    for ( var i = 0; i < width * height; i ++ ) {
        heigthData[i] = 0
    }

    var imgd = context.getImageData(0, 0, width, height);
    var pix = imgd.data;
    var maxHeight = 0;
    var j=0;
    var all = 0;
    for (var i = 0, n = size; i < n; i += (4)) {
        all = pix[i]+pix[i+1]+pix[i+2];
        heigthData[j++] = all/100;
        if (heigthData[j] > maxHeight) {
            maxHeight = heigthData[j];
        };
    }
    return heigthData;
    }

    function getMaxHeight(heightmap, size){
        var maxHeight = 0;
        for (var i = 0, n = size; i < n; i++) {
            if (heightmap[i] > maxHeight) {
                maxHeight = heightmap[i];
            }
        }

        return maxHeight;
    }

    /**
     * Returns the given height at the specified heightmap position.
     *
     * @param {Number} x: Position X on the heightmap. 
     * @param {Number} y: Position Y on the heightmap.
     *   (which is the relative z position of the vertex in 3D space)
     * @return {Number}
     *   The height at the specified postion.
     *   (which is the y position for the vertex)
     */
    Heightmap.prototype.getHeight = function(x, y) {
        // Ensure we are within the boundaries of the heightmap.
        // This will get really handy when we try to determine normals
        // for border vertices where we try to access heights at
        // positions that are not within the heightmap.
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x >= this.maxWidth) x = x % (this.width - 1);
        if (y >= this.maxDepth) y = y % (this.height - 1);

        // Determine the height at the specified vertex position.
        return this.heightmap[y * this.width + x];
    };

    return Heightmap;
})();

/**
 * Class: TerrainBlock.
 *
 * Represents a 3 dimensional block of terrain based upon a
 * given heightmap. The block can be positioned on a specific
 * absolute position within 3D space and can be scaled
 * vertically and horizontally.
 */
var TerrainBlock = (function () {

    /**
     * Terrain scaling.
     *
     * Changing these constants will change the scale of the
     * terrain either horizontally (distance between the vertices
     * on a plane) or vertically by scaling the height returned
     * from the Heightmap making the terrain look more level
     * (SCALE_VERTICAL < 1) or more rocky (SCALE_VERTICAL > 1).
     */
    TerrainBlock.SCALE_HORIZONTAL = 1;
    TerrainBlock.SCALE_VERTICAL = 1;

    /**
     * Constructor
     *
     * @param {Array} heightmap: An instance of the Heightmap class.
     * @param {Number} x: Absolute X position of the terrain block.
     * @param {Number} y: Absolute Y position of the terrain block.
     * @param {Number} z: Absolute Z position of the terrain block.
     */
    function TerrainBlock(img, width, height, maxWidth, maxDepth) {
        this.heightmap = new Heightmap(img, width, height, maxWidth, maxDepth);

        // Calculate width and depth of the terrain block
        // based on the heightmap dimensions but with scaling applied.
        // this.width = width * TerrainBlock.SCALE_HORIZONTAL;               ORIGINAL
        // this.depth = height * TerrainBlock.SCALE_HORIZONTAL;

        this.width = maxWidth * TerrainBlock.SCALE_HORIZONTAL;
        this.depth = maxDepth * TerrainBlock.SCALE_HORIZONTAL;

        // Calculate the count of squares
        this.squares = (this.width - 1) * (this.depth - 1);

        // This is where we will put our resulting data, which
        // represents the geometry of the terrain block.
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.colors = [];
    };

    /**
     * Builds terrain vertices.
     */
     TerrainBlock.prototype.buildVertices = function () {
        var map = this.heightmap;
        var rX, rZ,     // Current relative position (scaled).
            vX, vZ,     // Current vertex position (on heightmap).
            height,     // Current vertex height (scaled).
            nX, nZ;     // Current vertex normal.
        var bottomColor = [102, 51, 0], topColor = [ 0, 102, 0], maxHeight = map.maxHeight;
        for (rZ = 0; rZ < this.depth; rZ += TerrainBlock.SCALE_HORIZONTAL) {
            for (rX = 0; rX < this.width; rX += TerrainBlock.SCALE_HORIZONTAL) {

                // Calculate vertex position (on heightmap).
                vX = rX / TerrainBlock.SCALE_HORIZONTAL;
                vZ = rZ / TerrainBlock.SCALE_HORIZONTAL;

                // Get scaled height at current vertex position.
                height = map.getHeight(vX, vZ);
                height = height * TerrainBlock.SCALE_VERTICAL;

                //vertex = [rX, height, rZ];
                //this.vertices.push(vertex);

                this.vertices.push(rX);
                this.vertices.push(height);
                this.vertices.push(rZ);

                // Determine normal.
                nX = -(map.getHeight(vX + 1, vZ) - map.getHeight(vX - 1, vZ));
                nZ = (map.getHeight(vX, vZ + 1) - map.getHeight(vX, vZ - 1));

                this.normals.push(nX * TerrainBlock.SCALE_VERTICAL);
                this.normals.push(2 * TerrainBlock.SCALE_HORIZONTAL);
                this.normals.push(nZ * TerrainBlock.SCALE_VERTICAL);

                this.normals.push(nX * TerrainBlock.SCALE_VERTICAL);
                this.normals.push(2 * TerrainBlock.SCALE_HORIZONTAL);
                this.normals.push(nZ * TerrainBlock.SCALE_VERTICAL);

        this.colors.push((bottomColor[0] + (topColor[0] - bottomColor[0]) * ( 2 * height / maxHeight)) / 255);
        // this.colors.push(rZ % 4);
        this.colors.push((bottomColor[1] + (topColor[1] - bottomColor[1]) * ( 2 * height / maxHeight)) / 255);
        // this.colors.push(rX % 3);
        this.colors.push((bottomColor[2] + (topColor[2] - bottomColor[2]) * ( 2 * height / maxHeight)) / 255);
        // this.colors.push((rX + rZ) % 5);
            }
        }
    };

    /**
     * Builds terrain indices.
     */
     TerrainBlock.prototype.buildIndices = function () {
        for (z = 0; z < this.depth-1; z++){
            for (x = 0; x < this.width-1; x++){
                // Triangle 1
                this.indices.push(x + z * this.depth);
                this.indices.push(x + (z+1) * this.depth);
                this.indices.push(x+1 + z * this.depth);

                // Triangle 2
                this.indices.push(x+1 + z * this.depth);
                this.indices.push(x + (z+1) * this.depth);
                this.indices.push(x+1 + (z+1) * this.depth);
            }
        }
    };

    /**
     * Builds terrain indices.
     */
    TerrainBlock.prototype.buildBuffers = function (gl) {

    this.normalBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, this.normals, 3);
    this.colorBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, this.colors, 3);
    this.vertexBuffer = _buildBuffer(gl, gl.ARRAY_BUFFER, this.vertices, 3);
    this.indexBuffer = _buildBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, this.indices, 1);
    this.isFinished = true;
    };

    var _buildBuffer = function( gl, type, data, itemSize ){
    var buffer = gl.createBuffer();
    var arrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, new arrayView(data), gl.STATIC_DRAW);
    buffer.itemSize = itemSize;
    buffer.numItems = Math.floor(data.length / itemSize);
    // buffer.numItems = data.length;
    return buffer;
  }

    return TerrainBlock;
})();