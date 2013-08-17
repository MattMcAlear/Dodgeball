"use strict";
var objjs = {};

objjs.loadTexture = function loadTexture(filePath, texture, gl)  {
	var i = texture.length;
	texture[i] = gl.createTexture();
	texture[i].image = new Image();
  	texture[i].image.onload = function(){
  		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture[i]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture[i].image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	texture[i].image.src = filePath;
} 

objjs.initTexture = function initTexture(fileName, gl) {
	var request = new XMLHttpRequest();
    request.open("GET", fileName+'.mtl');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            var lines = request.responseText.split("\n");
            
            for(var i=0; i<lines.length; i++){
                var vals = lines[i].split(" ");
                
                if(vals[0] == "map_Kd"){
                	objjs.loadTexture(vals[1], texture, gl);
                }
            }
        }
    }
    request.send();
}

objjs.handleLoadedObject = function handleLoadedObject(data) {
    var lines = data.split("\n");
    
	var vX = [];
	var vY = [];
	var vZ = [];
	var vtX = [];
	var vtY = [];
	var vCount = 0;
	var vtCount = 0;
	
	for(var i=0; i<lines.length; i++){
		var vals = lines[i].split(" ");
		
		if(vals[0] == 'g'){
			var isObj=false;
			for(var ii=0; ii<objects.length; ii++){
				if(vals[2] == objects[ii].name){
					isObj=true;
				}
			}
			if(!isObj){
				if(vals[2].substr(0, 9).toLowerCase() == 'dodgeball'){
					var objType=1;
				}else if(vals[2].substr(0, 3).toLowerCase() == 'map'){
					var objType=0;
				}else if(vals[2].substr(0, 6).toLowerCase() == 'player'){
					var objType=1;
				}

				objects.push(
					{
						name:							vals[2], //ect: ball, map, player
						type: 							objType, //0=fixed, 1=moves
						minX:							null, 	//For collision detection
						maxX:							null,	//For collision detection
						minY:							null,	//For collision detection
						maxY:							null,	//For collision detection
						minZ:							null,	//For collision detection
						maxZ:							null,	//For collision detection
						cameraPos:						[],	
						cameraLook:						[],
						cameraPan:						[],
						pitch:							0,
						pitchRate:						0,
						yaw:							0,
						yawRate:						0,
						speed:							0,
						lives:							0, 	//For player
						score:							0, 	//For player
						timeInAir:						0, 	//For Physics
						vertexPositions:				[],		
						vertexTextureCoords:			[],
						vertexCount:					[],
						objVertexPositionBuffer:		[],
						objVertexTextureCoordBuffer:	[],
						textures: 						[],
						objTexture:						[]
					}
				);
			}
		}
		if(vals[0] == 'usemtl' && vals[1] != 'FrontColor' && vals[1] != 'ForegroundColor'){
			allTex.push(vals[1]);
			
			if(objects[objects.length-1].textures.length == 0){ 
				objects[objects.length-1].textures.push(vals[1]);
			}else{
				var isUnique = true;
				for(var a=0; a<objects[objects.length-1].textures.length; a++){
					if(vals[1] == objects[objects.length-1].textures[a]){
						isUnique = false;
					}
				}
				if(isUnique == true){
					objects[objects.length-1].textures.push(vals[1]);
				}
			}
		}
		if(vals[0] == 'v'){
			vX[vCount] = vals[1];
			vY[vCount] = vals[2];
			vZ[vCount] = vals[3];
			
			vCount++;
		}
		if(vals[0] == 'vt'){
			vtX[vtCount] = vals[1];
			vtY[vtCount] = vals[2];
			
			vtCount++;
		}
	}
	
	for(var i=0; i<lines.length; i++){
		var vals = lines[i].split(" ");
		if(vals[0] == 'usemtl' && vals[1] != 'FrontColor' && vals[1] != 'ForegroundColor'){
			allTexCount++;
			allTexLength.push(0);
		}
		if(vals[0] == 'f'){
			for(var ii=1; ii<vals.length; ii++){
				var val = vals[ii].split("/");
				
				for(var iii=1; iii<objects.length; iii++){
					for(var a=0; a<objects[iii].textures.length; a++){
						if(allTex[allTexCount] == objects[iii].textures[a]){
							if(typeof objects[iii].vertexPositions[a] == "undefined"){
								objects[iii].vertexPositions[a] = [];
								objects[iii].vertexTextureCoords[a] = [];
								objects[iii].vertexCount[a] = 0;
							}
							objects[iii].vertexPositions[a].push(parseFloat(vX[(val[0]-1)]));
							objects[iii].vertexPositions[a].push(parseFloat(vY[(val[0]-1)]));
							objects[iii].vertexPositions[a].push(parseFloat(vZ[(val[0]-1)]));
						
							objects[iii].vertexTextureCoords[a].push(parseFloat(vtX[(val[1]-1)]));
	                		objects[iii].vertexTextureCoords[a].push(parseFloat(vtY[(val[1]-1)]));
							
							objects[iii].vertexCount[a] += 1;
							
							//set min and max levels 
							{
							//minX
							if(objects[iii].minX == null){
								objects[iii].minX = vX[(val[0]-1)];
							}else if(objects[iii].minX > vX[(val[0]-1)]){
								objects[iii].minX = vX[(val[0]-1)];
							}else{
								//nothing
							}
							
							//maxX
							if(objects[iii].maxX == null){
								objects[iii].maxX = vX[(val[0]-1)];
							}else if(objects[iii].maxX < vX[(val[0]-1)]){
								objects[iii].maxX = vX[(val[0]-1)];
							}else{
								//nothing
							}
							
							//minY
							if(objects[iii].minY == null){
								objects[iii].minY = vY[(val[0]-1)];
							}else if(objects[iii].minY > vY[(val[0]-1)]){
								objects[iii].minY = vY[(val[0]-1)];
							}else{
								//nothing
							}
							
							//maxY
							if(objects[iii].maxY == null){
								objects[iii].maxY = vY[(val[0]-1)];
							}else if(objects[iii].maxY < vY[(val[0]-1)]){
								objects[iii].maxY = vY[(val[0]-1)];
							}else{
								//nothing
							}
							
							//minZ
							if(objects[iii].minZ == null){
								objects[iii].minZ = vZ[(val[0]-1)];
							}else if(objects[iii].minZ > vZ[(val[0]-1)]){
								objects[iii].minZ = vZ[(val[0]-1)];
							}else{
								//nothing
							}
							
							//maxZ
							if(objects[iii].maxZ == null){
								objects[iii].maxZ = vZ[(val[0]-1)];
							}else if(objects[iii].maxZ < vZ[(val[0]-1)]){
								objects[iii].maxZ = vZ[(val[0]-1)];
							}else{
								//nothing
							}
							}
						}
					}
				}
				
				allTexLength[(allTexLength.length-1)]++;
			}
		}
	}

	for(var i=1; i<objects.length; i++){
		for(var ii=0; ii<objects[i].textures.length; ii++){			
	        objects[i].objVertexPositionBuffer[ii] = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].objVertexPositionBuffer[ii]);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objects[i].vertexPositions[ii]), gl.STATIC_DRAW);
	        objects[i].objVertexPositionBuffer[ii].itemSize = 3;
	        objects[i].objVertexPositionBuffer[ii].numItems = objects[i].vertexCount[ii];
	
	        objects[i].objVertexTextureCoordBuffer[ii] = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, objects[i].objVertexTextureCoordBuffer[ii]);
	        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objects[i].vertexTextureCoords[ii]), gl.STATIC_DRAW);
	        objects[i].objVertexTextureCoordBuffer[ii].itemSize = 2;
	        objects[i].objVertexTextureCoordBuffer[ii].numItems = objects[i].vertexCount[ii];			
	    }
	}
	
	return true;	
}

objjs.loadObject = function loadObject(fileName, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", fileName+'.obj');
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            objjs.handleLoadedObject(request.responseText);
			callback && callback();
        }
    }
    request.send();
}