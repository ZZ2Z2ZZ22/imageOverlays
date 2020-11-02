<template>
    <el-container>
        <el-main style="align-items: flex-start">
            <div id="map"></div>
        </el-main>
        <el-aside width="420px" style="margin-top: 0px">
            <el-card shadow="always" id="editBoxData" style="width: 400px; margin-top: 0px;">
                <div slot="header">
                    <span>当前边框</span>
                </div>
                <el-table 
                :data="editingBoxData"
                ref="nonMarkBoxTable"
                highlight-current-row
                @current-change="handleCurrentChange" 
                style="width: 100%">
                    <el-table-column
                        prop="id"
                        label="序号"
                        width="80">
                    </el-table-column>
                    <el-table-column
                        prop="xRange"
                        label="x坐标范围"
                        width="150">
                    </el-table-column>
                    <el-table-column
                        prop="yRange"
                        label="y坐标范围"
                        width="150">
                    </el-table-column>
                </el-table>
                <el-form :inline="true" style="margin-top: 20px">
                    <el-form-item label="目标名">
                        <el-input v-model="bndBoxName" 
                        placeholder="请输入标注目标名称"
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleConfirmMark">确认标注</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
            <el-card shadow="never" id="confirmedBoxData" style="width: 400px; margin-top: 25px">
                <div slot="header">
                    <span>已标注边框</span>
                    <el-button type="text" style="float: right; padding: 3px 0" @click="handleSubmit">提交</el-button>
                </div>
                <el-table 
                :data="bndBoxData"
                ref="markedBoxTable"
                highlight-current-row
                @current-change="handleCurrentChange"  
                style="width: 100%; margin-bottom: 25px;">
                    <el-table-column
                        fixed="left"
                        prop="id"
                        label="序号"
                        width="50">
                    </el-table-column>
                    <el-table-column
                        prop="bndBoxName"
                        label="目标名"
                        width="70">
                    </el-table-column>
                    <el-table-column
                        prop="xRange"
                        label="x坐标范围"
                        width="85">
                    </el-table-column>
                    <el-table-column
                        prop="yRange"
                        label="y坐标范围"
                        width="85">
                    </el-table-column>
                    <el-table-column
                        fixed="right"
                        label="操作"
                        width="70">
                        <template slot-scope="scope">
                            <el-col>
                                <el-button @click="handleEditMarked(scope.row)" type="text" size="small">编辑</el-button>
                            </el-col>
                            <el-col>
                                <el-button @click="handleDeleteRow(scope.row)" type="text" size="small">删除</el-button>
                            </el-col>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </el-aside>
    </el-container>
</template>

<script>
import AILabel from 'ailabel'
import axios from "axios"

var props = {
    mode:{
        type: String,
        default: "drawRect"
    },
    // 父组件传递base64格式的图片数据
    img: {
        type: String,
        default: ""
    }
}
// 数据对象
var data = function() {
    return {
        idCount: 0, // 边框序号，每新加载一张图片，都要置0
        imgWidth: 0,
        imgHeight: 0,
        // imgSrc: this.img,
        gMap: "",
        isSelected: "", // 是否有标注边框被选中，控制编辑模式
        // 当前边框数据
        // bnxboxname不可以为undefined，必须有初始值，因为当前边框使用的是v-show
        bndBoxName: "",
        editingBoxData: [],
        // 已标注好的边框数据
        bndBoxData: [],
        currentBndBox: "" //当前选中的边框
    }
}

var methods = {
    /**
     * part 1:
     * 一些工具函数
     */

    // 封装的节流函数
    throttle: function(fn, delay=500){
        let timer = null;
        return function () {
            if (timer){
                return;
            }
            timer = setTimeout( () => {
                fn.apply(this, arguments);
                timer = null;
            }, delay);
        };
    },
    // object转xml的工具
    parse2xml: function(data){
        var xmldata = '';
        for(var i in data){
            xmldata+= '<'+i+'>';
            if(typeof data[i] === 'object'){
                xmldata+= this.parse2xml(data[i]);
            }else{
                xmldata+= data[i];
            }
            xmldata+= '</'+i+'>';
        }
        return xmldata;
    },

    // 得到标注矢量层 gFeatureLayer
    getFeatureLayer: function(){
        if (this.gMap.oLayers[4]){
            return this.gMap.oLayers[4];
        }else{
            console.log("Can't get gFeatureLayers, it doesn't exist.");
        }
    },

    // 改变模式 暂时选项：矩形；（待实现：多边形）
    setMode: function(mode){
        // 根据传入参数变换样式
        let gFeatureStyle = {};
        if (mode === "drawRect"){
            gFeatureStyle = new AILabel.Style({strokeColor: '#0000FF', lineWeight: 2});
        }
        this.gMap && this.gMap.setMode(mode, gFeatureStyle);
    },

    // 根据points等直接生成一个边框的数据
    calculateRange: function(points, boxId, featureId){
        let x1 = points[0].x, x2 = points[1].x;
        let y1 = points[1].y, y2 = points[2].y;
        let xmax, xmin, ymax, ymin;

        [xmax, xmin] = (x1 > x2) ? [x1, x2] : [x2, x1];
        [ymax, ymin] = (y1 > y2) ? [y1, y2] : [y2, y1];
        
        let bndData = {
            id: boxId,
            featureId: featureId,
            bndBoxName: "",
            xRange: "("+ xmin.toFixed(2) + "," + xmax.toFixed(2) + ")",
            yRange: "("+ ymin.toFixed(2) + "," + ymax.toFixed(2) + ")"
        }
        return bndData;
    },

    // 修改未标注列表中的坐标
    calculateExistRange: function(index, points){
        if (index === -1) return;

        let x1 = points[0].x, x2 = points[1].x;
        let y1 = points[1].y, y2 = points[2].y;
        let xmax, xmin, ymax, ymin;

        [xmax, xmin] = (x1 > x2) ? [x1, x2] : [x2, x1];
        [ymax, ymin] = (y1 > y2) ? [y1, y2] : [y2, y1];
        this.editingBoxData[index].xRange = "("+ xmin.toFixed(2) + "," + xmax.toFixed(2) + ")";
        this.editingBoxData[index].yRange = "("+ ymin.toFixed(2) + "," + ymax.toFixed(2) + ")";
    },

    /**
     * 在未标注边框中查找是否存在对应featureid
     * params: val || 可能是featureid ; 可能是bndboxdata对象
     * return: 不存在：-1；存在：返回对应下标值
     */
    findFeatureNonMark: function (val){
        if (val){
            if (typeof val === "object" && val != null){
                return this.editingBoxData.indexOf(val);
            }else if (typeof val === "string"){
                const len = this.editingBoxData.length;
                for (let i = 0; i < len; i++){
                    if (this.editingBoxData[i].featureId === val){
                        return i;
                    }
                }
                return -1;
            }
        }
    },

    /**
     * 在已标注边框中查找是否存在对应featureid
     * params: val 可能是featureId || bndboxdata
     * return: 不存在：-1；存在：返回对应下标值
     */
    findFeatureMarked: function (val){
        if (val){
            if (typeof val === "object" && val != null){
                return this.bndBoxData.indexOf(val);
            }else if (typeof val === "string"){
                const len = this.bndBoxData.length;
                for (let i = 0; i < len; i++){
                    if (this.bndBoxData[i].featureId === val){
                        return i;
                    }
                }
                return -1;
            }
        }
    },

    // 在未标注边框列表中删除对应标注边框
    removeFromNonMarkData: function (featureId){
        const index = this.findFeatureNonMark(featureId);
        if (index !== -1){
            this.editingBoxData.splice(index, 1);
        }else{
            console.log("Can't remove non-exist feature in non-mark data list.");
        }
    },

    // 在已标注边框列表中删除对应标注边框
    removeFromMarkedData: function (featureId){
        const index = this.findFeatureMarked(featureId);
        if (index !== -1){
            this.bndBoxData.splice(index, 1);
        }else{
            console.log("Can't remove non-exist feature in marked data list.");
        }
    },

    // 给边框加删除按钮
    // 参数为feature对象（注意不是featureId）
    addDeleteMarker(feature){
        let that = this;
        let cFeature = feature;
        const feaId = cFeature.id;
        
        const marker = this.gMap.mLayer.getMarkerById(`marker-${feaId}`);
        if (marker) return; //有删除按钮存在就返回

        const featureBounds = cFeature.getBounds();
        const leftTopPoint = featureBounds[0]; // 边界坐上角坐标
        let deleteMarker = new AILabel.Marker(`marker-${feaId}`,
            {
                src: require('../../assets/delete.png'),
                x: leftTopPoint.x,
                y: leftTopPoint.y,
                offset: {
                    x: 0,
                    y: 0
                },
                featureId: feaId
            });
        this.gMap.mLayer.addMarker(deleteMarker);
        
        // 监听删除边框事件：删除选定的边框
        deleteMarker.regEvent('click', function () {
            const feaId = this.info.featureId;
            that.handleDeleteFeature(feaId);
        });
    },

    // 删除指定边框的删除按钮
    removeDeleteMarker(featureId){
        let feaId = featureId;
        this.gMap.mLayer.removeMarkerById(`marker-${feaId}`);
    },

    /**
     * 选中边框改变
     * 当参数为对象，说明当前列表项被选择，直接执行当前行改变；
     * 当参数为字符串，说明某个边框在矢量层被选择，再次调用本函数执行当前行改变
     */

    // 改变当前行并且改变高亮状态
    currentChangeNonMark(val){
        if (val){
            let pre = this.currentBndBox;
            let feaLayer = this.getFeatureLayer();
            if (pre){
                let preFea = feaLayer.getFeatureById(pre.featureId);
                this.removeDeleteMarker(pre.featureId);
                if (preFea){
                    preFea.deActive();
                }
            }
            this.currentBndBox = val;
            this.$refs.nonMarkBoxTable.setCurrentRow(val);
            this.$refs.markedBoxTable.setCurrentRow();

            let fea = feaLayer.getFeatureById(val.featureId);
            fea.active();
            this.addDeleteMarker(fea);
        }
    },
    // 改变当前行并且改变高亮状态
    currentChangeMarked(val){
        if (val){
            let pre = this.currentBndBox;
            let feaLayer = this.getFeatureLayer();
            if (pre){
                let preFea = feaLayer.getFeatureById(pre.featureId);
                this.removeDeleteMarker(pre.featureId);
                // console.log("pre", pre);
                if (preFea){
                    // this.removeDeleteMarker(preFea.id);
                    preFea.deActive();
                }
            }

            this.currentBndBox = val;
            this.$refs.markedBoxTable.setCurrentRow(val);
            this.$refs.nonMarkBoxTable.setCurrentRow();

            let fea = feaLayer.getFeatureById(val.featureId);
            fea.active();
            this.addDeleteMarker(fea);
        }
    },

    /**
     * part 2: 
     * 边框标注事件的回调函数，一共四个事件：
     * 1. 边框绘制
     * 2. 进入编辑模式
     * 3. 编辑模式中
     * 4. 结束编辑模式
     */

    // 矩形边框绘制函数
    drawRectBox(type, points, gFeatureStyle = {}){
        // 生成元素唯一标志（时间戳）
        const timestamp = new Date().getTime();
        // 元素添加
        let featureId = `feature-${timestamp}`;
        let fea = new AILabel.Feature.Rect(featureId, points, {
            id: ++this.idCount
        }, gFeatureStyle);
        let gFeatureLayer = this.getFeatureLayer();
        gFeatureLayer.addFeature(fea);

        let bndData = this.calculateRange(points, fea.data.id, featureId);
        this.editingBoxData.push(bndData);
        this.handleCurrentChange(bndData);
        // that.isSelected = true;
    },

    // 进入编辑模式
    // feature: 标注对象；如果传入的参数仅是标注对象的id，则需要转换为feature对象
    enterEditMode(feature){
        // var that = this;
        let cFeature = feature;
        // 转换为feature对象
        if (typeof feature !== "object"){
            let feaLayer = this.getFeatureLayer();
            cFeature = feaLayer.getFeatureById(feature);
        }

        // 同时在编辑框选中当前边框
        const feaId = cFeature.id;
        this.handleCurrentChange(feaId);
        const index = this.findFeatureNonMark(feaId);
        if (index === -1) return;

        // 删除按钮添加
        // this.addDeleteMarker(cFeature);
    },

    // 编辑模式中
    updateEditMode(type, feature, points){
        if (!this.gMap.mLayer) return;
        // 得到选定的边框id
        const index = this.findFeatureNonMark(feature.id);
        if (index === -1) return;

        const marker = this.gMap.mLayer.getMarkerById(`marker-${feature.id}`);
        if (!marker) return; //不存在就返回
        
        const bounds = AILabel.Util.getBounds(points);
        const leftTopPoint = bounds[0]; // 边界坐上角坐标
        marker.update({x: leftTopPoint.x, y: leftTopPoint.y});

        // 在这里实时变更编辑框中的数据
        this.calculateExistRange(index, points);
    },

    endEditMode(type, activeFeature, points){
        const index = this.findFeatureNonMark(activeFeature.id);
        if (index === -1) return;

        activeFeature.update({points});
        activeFeature.show();

        // 通过points来更新编辑框中的坐标范围数据
        if (index === -1) return;
        this.calculateExistRange(index, points);
    },

    /**
     * part 3:
     * 页面按钮的handler
     */

    // 确认标注边框数据，将当前编辑框数据加入已标注好数据列表中
    handleConfirmMark: function(){
        if (this.editingBoxData.length === 0){
            this.$message.error('当前无可标注边框');
        }else if (this.bndBoxName === ""){
            this.$message.error('请输入标记目标名称！');
        }else if (!this.currentBndBox && this.editingBoxData.length !== 1){
            this.$message.error('请选中一个边框再确认标记！');
        }else{
            if (this.editingBoxData.length === 1){
                this.currentBndBox = this.editingBoxData[0];
            }
            this.currentBndBox.bndBoxName = this.bndBoxName;
            // 加入已标记列表
            this.bndBoxData.push(this.currentBndBox);
            // 在未标记列表中删除
            this.removeFromNonMarkData(this.currentBndBox.featureId);

            let feaLayer = this.getFeatureLayer();
            const fea = feaLayer.getFeatureById(this.currentBndBox.featureId);
            this.removeDeleteMarker(fea.id);
            fea.deActive();

            this.bndBoxName = "";
            this.currentBndBox = "";
        }
    },

    // 响应表格行：选中当前行， 并且高亮
    handleCurrentChange(val) {
        let index_1 = -1;
        let index_2 = -1;
        index_1 = this.findFeatureNonMark(val);
        index_2 = this.findFeatureMarked(val);
       
        if (index_1 !== -1){ //在未标注列表中
            this.currentChangeNonMark(this.editingBoxData[index_1]);
        }else if (index_2 !== -1){ //在标注列表中
            this.currentChangeMarked(this.bndBoxData[index_2]);
        }else{
            this.$refs.nonMarkBoxTable.setCurrentRow();
            this.$refs.markedBoxTable.setCurrentRow();
        }
    },

    /**
     * 删除矢量层边框标注：
     * 0. 对应删除矢量层中的标注
     * 1. 对应删除已标注列表
     * 2. 对应删除矢量层中的feature
     * 
     * 1. 删除未标注矩形框（若存在）
     * 2. 删除已标注矩形框（若存在）
     */
    handleDeleteFeature: function(featureId){
        const feaId = featureId;

        // 对应删除矢量层中的边框标注
        const feaLayer = this.getFeatureLayer();
        feaLayer.removeFeatureById(feaId);

        // const num = this.bndBoxData.length;
        // 对应删除未标注矩形框数据
        this.removeFromNonMarkData(feaId);

        // 对应删除已标记边框列表中的数据
        this.removeFromMarkedData(feaId);
        
        // 对应删除标注层中删除（x）icon
        this.gMap.mLayer.removeAllMarkers();
        // that.isSelected = false;
    },

    /**
     * 已标注列表的编辑/删除按钮的回调函数：
     */

    // 响应编辑按钮：把已标注列表数据放到未标注列表
    handleEditMarked(rowId){
        const index = this.findFeatureMarked(rowId);

        let temp = this.bndBoxData.splice(index, 1);
        this.editingBoxData.push(temp[0]);
        this.bndBoxName = temp[0].bndBoxName;
        // this.handleCurrentChange(temp);
        this.enterEditMode(temp[0].featureId);
    },
    // 删除某行已标注边框数据
    handleDeleteRow: function(rowId){
        let index = this.bndBoxData.indexOf(rowId);
        if (index !== -1){
            const feaId = rowId.featureId;
            this.handleDeleteFeature(feaId);
        }else{
            console.log("bound box doesn't exist.");
        }
    },

    handleClearSubmitData: function(){
        if (!this.bndBoxData.length) return;

        let len = this.bndBoxData.length;
        while (len--){
            let temp = this.bndBoxData.pop();
            this.handleDeleteFeature(temp.featureId);
        }
    },

    // 向后端提交图片属性和边框属性数据
    handleSubmit: function(){
        if (!this.bndBoxData.length) {
            this.$message({
                type: 'warning',
                message: '已标注边框列表为空，无法提交数据'
            });
            return;
        }

        const url = "";
        const postData = {
            folder: "",
            filename: "",
            path: "",
            source: {
                database: ""
            },
            size: {
                width: this.imgWidth,
                height: this.imgHeight,
                depth: 0
            },
            segmented: 0
        }
        let postData = this.parse2xml(postData);
        this.$confirm('此操作将提交全部已标注数据到后台, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(() => {
            // axios.post(url, postData);
            this.$message({
                type: 'success',
                message: '提交成功!'
            });
            //清空已提交数据
            this.handleClearSubmitData();
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消提交'
          });          
        });
    }
}

export default {
    data: data,
    props: props,
    methods: methods,
    watch: {
        img: function(){
            var that = this;

            function loadImg(src){
                return new Promise((resolve,reject)=>{
                    let img = new Image();
                    img.src = src;
                    img.onload = () => {
                        resolve(img);
                    }
                    img.onerror=(err)=>{
                        reject(err)
                    }
                })
            }

            loadImg(this.img).then(img => {
                this.idCount = 0;
                this.imgWidth = img.width;
                this.imgHeight = img.height;
                let gFeatureStyle = {};

                /**
                 * 容器对象（gMap）声明：
                 * cx, cy：初始中心点坐标
                 * autoPan: 绘制过程中是否允许自动平移
                 * autoZoom：绘制过程中是否允许自动滚轮缩放
                 * 
                 * 1. 图片层：放置图片 gImageLayer
                 * 2. 矢量层：放置标注的边框 gFeatureLayer
                 */
                let gMapObj = new AILabel.Map('map', {
                    zoom: this.imgWidth, 
                    cx: 0, cy: 0, 
                    zoomMax: this.imgWidth, zoomMin: this.imgWidth, 
                    autoPan: true, drawZoom: true
                });

                // 图片层实例添加
                let gImageLayer = new AILabel.Layer.Image('img', this.img, 
                    {w: this.imgWidth, h: this.imgHeight},
                    {zIndex: 1});
                gMapObj.addLayer(gImageLayer);

                // 矢量层实例添加
                let gFeatureLayer = new AILabel.Layer.Feature('featureLayer', {zIndex: 2, transparent: true});
                gMapObj.addLayer(gFeatureLayer);

                // 自动进入禁止平移缩放模式
                gMapObj.setMode("banMap");
                // 添加边框：矩形边框绘制完成
                gMapObj.events.on('geometryDrawDone', function (type, points) {
                    that.drawRectBox(type, points, gFeatureStyle);
                });

                /**
                 * 以下是对矩形边框绘制的监听
                 * 1. 边框绘制完成 geometryDrawDone
                 * 2. 编辑模式开始：双击选中边框进入编辑模式 featureSelected
                 * 3. 编辑模式中：边框编辑过程中（即改变边框的大小过程中）geometryEditing
                 * 4. 编辑模式结束：编辑边框完成 geometryEditDone
                 */ 

                // 编辑模式开始：双击选中编辑矩形框，进入编辑模式
                gMapObj.events.on('featureSelected', function(feature){
                    that.enterEditMode(feature);
                });

                // 编辑模式中：实时变更最右方编辑框中的坐标数据
                gMapObj.events.on('geometryEditing', this.throttle(function (type, feature, points) {
                    that.updateEditMode(type, feature, points);
                }, 100));

                // 编辑模式结束：进入编辑模式之后，编辑边框完成
                gMapObj.events.on('geometryEditDone', function (type, activeFeature, points) {
                    that.endEditMode(type, activeFeature, points);
                });

                // feature-reset监听
                gMapObj.events.on('featureStatusReset', function () {
                    that.gMap.mLayer.removeAllMarkers();
                });

                // 窗口缩放监听：
                window.onresize = function () {
                    gMapObj && gMapObj.resize();
                }
                this.gMap = gMapObj;
                if (this.mode) this.setMode(this.mode);
            }).catch(err => {
                console.error(err);
            })            
        },
        mode: function(){
            if (this.mode) this.setMode(this.mode);
        }
    },
    computed: {
        imgWidthtest: function(){
            return this.imgWidth;
        },
        imgHeighttest: function(){
            return this.imgHeight;
        }
    },
    mounted() {
        this.gMap = "";
    }
}
</script>

<style scoped>
#map {
    width: 100%;
    height:600px;
    border: 1px solid #aaa;
    position: relative;
    margin-right: 10px;
    cursor: crosshair;
    -moz-user-select:none;/*火狐*/
    -webkit-user-select:none;/*webkit浏览器*/
    -ms-user-select:none;/*IE10*/
    -khtml-user-select:none;/*早期浏览器*/
    user-select:none;
}
</style>