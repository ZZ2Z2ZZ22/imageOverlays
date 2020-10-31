<template>
    <el-container>
        <el-main>
            <el-button id="drawRect" class="command-btn" @click="setMode('drawRect')">编辑矩形边框</el-button>
            <el-button id="pan" class="command-btn" @click="setMode('pan')">平移模式</el-button>
            <div id="map"></div>
        </el-main>
        <el-aside width="420px" style="margin-top: 20px">
            <el-card shadow="always" id="editBoxData" style="width: 400px; margin-top: 25px;">
                <div slot="header">
                    <span>当前边框</span>
                </div>
                <el-table 
                :data="editingBoxData"
                ref="nonMarkBoxTable"
                highlight-current-row
                @current-change="handleCurrentChange" 
                style="width: 100%">
                <!-- 多行选择，待实现 -->
                    <!-- <el-table-column
                    type="selection"
                    width="55">
                    </el-table-column> -->
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
                                <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
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

var props = {
    mode:{
        type: String,
        default: ""
    },
    //父组件只需要提供图片名称，图片必须放在static/img中，不然无法使用require动态加载
    img: {
        type: String,
        default: "test01.jpeg"
    }
}
// 数据对象
var data = function() {
    return {
        idCount: 0, // 边框序号，每新加载一张图片，都要置0
        imgWidth: 0,
        imgHeight: 0,
        imgSrc: require("../../../static/img/" + this.img),
        gMap: "",
        isSelected: false, // 是否有标注边框被选中，控制边框编辑框的显示
        // 当前边框数据
        // bnxboxname不可以为undefined，必须有初始值，因为当前边框使用的是v-show
        bndBoxName: "",
        editingBoxData: [
        //     {
        //     id: "",
        //     bndBoxName: "",
        //     xRange: "",
        //     yRange: ""
        // }
        ],
        // 已标注好的边框数据
        bndBoxData: [],
        currentBndBox: "" //当前选中的边框
    }
}

var methods = {
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

    // 得到标注矢量层 gFeatureLayer
    getFeatureLayer: function(){
        if (this.gMap.oLayers[4]){
            return this.gMap.oLayers[4];
        }else{
            console.log("Can't get gFeatureLayers, it doesn't exist.");
        }
    },

    // 暂时选项：矩形；平移（待实现：多边形）
    setMode: function(mode){
        // 根据传入参数变换样式
        let gFeatureStyle = {};
        if (mode === "drawRect"){
            gFeatureStyle = new AILabel.Style({strokeColor: '#0000FF', lineWeight: 2});
        }
        let btnNodes = document.getElementsByClassName('command-btn');
        for (let i = 0; i < btnNodes.length; i++){
            btnNodes[i].style.backgroundColor = "#FFF";
        }
        document.getElementById(mode).style.backgroundColor = "#3377ff";

        this.gMap && this.gMap.setMode(mode, gFeatureStyle);
    },

    calculateRange: function(points, boxId, featureId){
        let xmin = points[0].x;
        let xmax = points[1].x;
        let ymin = points[2].y;
        let ymax = points[1].y;
        // fixme: 在这里添加当前边框数据
        let bndData = {
            id: boxId,
            featureId: featureId,
            bndBoxName: "",
            xRange: "("+ xmin + "," + xmax + ")",
            yRange: "("+ ymin + "," + ymax + ")"
        }
        return bndData;
    },

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

            this.bndBoxName = "";
            this.currentBndBox = "";
        }
    },

    /**
     * 在未标注边框中查找是否存在对应featureid
     * params: val || 可能是featureid ; 可能是bndboxdata对象
     * return: 不存在：-1；存在：返回对应下标值
     */
    // findFeatureNonMark: function (featureId){
    //     const len = this.editingBoxData.length;
    //     for (let i = 0; i < len; i++){
    //         if (this.editingBoxData[i].featureId === featureId){
    //             return i;
    //         }
    //     }
    //     return -1;
    // },

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

    /**
     * 在未标注边框列表中删除对应标注边框
     */
    removeFromNonMarkData: function (featureId){
        const index = this.findFeatureNonMark(featureId);
        if (index !== -1){
            this.editingBoxData.splice(index, 1);
        }else{
            console.log("Can't remove non-exist feature in non-mark data list.");
        }
    },

    /**
     * 在已标注边框列表中删除对应标注边框
     */
    removeFromMarkedData: function (featureId){
        const index = this.findFeatureMarked(featureId);
        if (index !== -1){
            this.bndBoxData.splice(index, 1);
        }else{
            console.log("Can't remove non-exist feature in marked data list.");
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
     * 已标注列表的删除按钮的回调函数：
     * 删除某行已标注边框数据
     */
    handleDeleteRow: function(rowId){
        let index = this.bndBoxData.indexOf(rowId);
        if (index !== -1){
            const feaId = rowId.featureId;
            this.handleDeleteFeature(feaId);
        }else{
            console.log("bound box doesn't exist.");
        }
    },

    // 选中边框改变
    /**
     * 当参数为对象，说明当前列表项被选择，直接执行当前行改变；
     * 当参数为字符串，说明某个边框在矢量层被选择，再次调用本函数执行当前行改变
     */

    // 改变当前行并且改变高亮状态
    currentChangeNonMark(val){
        if (val){
            this.currentBndBox = val;
            this.$refs.nonMarkBoxTable.setCurrentRow(val);
            this.$refs.markedBoxTable.setCurrentRow();
        }
    },
    // 改变当前行并且改变高亮状态
    currentChangeMarked(val){
        if (val){
            this.currentBndBox = val;
            this.$refs.markedBoxTable.setCurrentRow(val);
            this.$refs.nonMarkBoxTable.setCurrentRow();
        }
    },

    // 选中当前行的响应事件
    handleCurrentChange(val) {
        // console.log("val", val);
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

    // 向后端提交图片属性和边框属性数据
    handleSubmit: function(){

    }
}

export default {
    data: data,
    props: props,
    methods: methods,
    computed: {
        // fixme: 测试图片属性响应式变化
        // imgWidthtemp: function (){
        //     let img = new Image();
        //     img.src = this.imgSrc;
        //     img.onload = function () {
        //         return img.width;
        //     }
        // },
        // imgHeighttemp: function(){
        //     let img = new Image();
        //     img.src = this.imgSrc;
        //     img.onload = function(){
        //         return img.height;
        //     }
        // }
    },
    mounted() {
        /**
         * 参数：
         * 1. 图片宽高
         * 2. 边框样式
         */

        // fixme：组件封装之后imgWidth和height应该随imgsrc的变化而变化
        this.imgWidth = 4256;
        this.imgHeight = 2832;
        let gFeatureStyle = {};
        var that = this;

        /**
         * 容器对象（gMap）声明：
         * cx, cy：初始中心点坐标
         * autoPan: 绘制过程中是否允许自动平移
         * autoZoom：绘制过程中是否允许自动滚轮缩放
         * 
         * 1. 图片层：放置图片
         * 2. 矢量层：放置标注的边框
         */

        let gMapObj = new AILabel.Map('map', {
            zoom: this.imgWidth * 2, 
            cx: 0, cy: 0, 
            zoomMax: this.imgWidth * 10, zoomMin: this.imgWidth / 10, 
            autoPan: true, drawZoom: true
        });
        this.gMap = gMapObj;

        // 缩放比例尺，左上角
        const scaleControl = new AILabel.Control.Scale(
            'scale-control-id',
            {postion: {left: 10, top: 10}}
        );
        this.gMap.addControl(scaleControl);
        
        // 图片层实例添加
        let gImageLayer = new AILabel.Layer.Image('img', this.imgSrc, 
            {w: this.imgWidth, h: this.imgHeight},
            {zIndex: 1});
        this.gMap.addLayer(gImageLayer);

        // 缩略图
        const eagleControl = new AILabel.Control.EagleMap(
            'eagle-control-id',
            {
                container: 'eagle-map', // 自定义缩略图控件展示位置
                // postion: {right: 10, bottom: 10}, // 当存在container时，此参数不需要传
                image: {src: this.imgSrc, width: this.imgWidth, height: this.imgHeight},
                grid: {
                    rowCount: 3,
                    columnCount: 3,
                    color: 'blue'
                },
                size: {
                    width: 200,
                    height: 150
                }
            }
        );
        this.gMap.addControl(eagleControl);

        // 矢量层实例添加
        let gFeatureLayer = new AILabel.Layer.Feature('featureLayer', {zIndex: 2, transparent: true});
        this.gMap.addLayer(gFeatureLayer);

        /**
         * 以下是对矩形边框绘制的监听
         * 1. 边框绘制完成 geometryDrawDone
         * 2. 双击选中边框进入编辑模式 featureSelected
         * 3. 边框编辑过程中（即改变边框的大小过程中）geometryEditing
         * 4. 编辑边框完成 geometryEditDone
         */ 

        // 矩形边框绘制完成
        this.gMap.events.on('geometryDrawDone', function (type, points) {
            // 生成元素唯一标志（时间戳）
            const timestamp = new Date().getTime();
            // 元素添加
            let featureId = `feature-${timestamp}`;
            let fea = new AILabel.Feature.Rect(featureId, points, {
                id: ++that.idCount
            }, gFeatureStyle);
            gFeatureLayer.addFeature(fea);

            let bndData = that.calculateRange(points, fea.data.id, featureId);
            that.editingBoxData.push(bndData);
            that.handleCurrentChange(bndData);
            // that.isSelected = true;
        });

        // 进入编辑模式之后，编辑边框完成
        this.gMap.events.on('geometryEditDone', function (type, activeFeature, points) {
            activeFeature.update({points});
            activeFeature.show();
            // fixme：在这里更新当前边框编辑框
            // let feaId = activeFeature.id;

            // 通过points来更新编辑框中的坐标范围数据
            console.log("edit done：矩形框坐标数据", points);
        });

        // feature-reset监听
        this.gMap.events.on('featureStatusReset', function () {
            that.gMap.mLayer.removeAllMarkers();
        });

        // ？为什么这里要做编辑中的监听
        // 可以实时变更最右方编辑框中的坐标数据
        this.gMap.events.on('geometryEditing', this.throttle(function (type, feature, points) {
            if (!this.gMap.mLayer) return;
            // 得到选定的边框id
            const marker = this.gMap.mLayer.getMarkerById(`marker-${feature.id}`);
            if (!marker) return; //不存在就返回
            
            const bounds = AILabel.Util.getBounds(points);
            const leftTopPoint = bounds[0]; // 边界坐上角坐标
            marker.update({x: leftTopPoint.x, y: leftTopPoint.y});
            // 在这里实时变更编辑框中的数据
        }, 1000));

        // 双击选中编辑矩形框，进入编辑模式
        this.gMap.events.on('featureSelected', function (feature) {
            let cFeature = feature;
            // 同时在编辑框选中当前边框
            that.handleCurrentChange(cFeature.id);

            // 删除按钮添加
            const featureBounds = cFeature.getBounds();
            const leftTopPoint = featureBounds[0]; // 边界坐上角坐标
            let deleteMarker = new AILabel.Marker(`marker-${cFeature.id}`,
                {
                    src: require('../../assets/delete.png'),
                    x: leftTopPoint.x,
                    y: leftTopPoint.y,
                    offset: {
                        x: 0,
                        y: 0
                    },
                    featureId: cFeature.id
                });
            that.gMap.mLayer.addMarker(deleteMarker);
            
            // 监听删除边框事件
            // 删除选定的边框
            // 封装一个函数
            // params: featureId, 
            deleteMarker.regEvent('click', function () {
                const feaId = this.info.featureId;
                that.handleDeleteFeature(feaId);
            });
        });

        window.onresize = function () {
            this.gMap && this.gMap.resize();
        }
    }
}
</script>

<style scoped>
/* .el-table tr.current-row>td{
    background-color: #a38d11 !important;
    color: #fff;
} */

#map {
    width: 100%;
    height: 600px;
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
.command-btn {
    display: inline-block;
    margin: 0 20px;
    margin-top: 10px;
    font-size: 15px;
    padding: 5px 10px;
    border: 1px solid #aaa;
}
</style>