<template>
    <el-container>
        <el-main>
            <!-- <img src="../../../static/img/test01.jpeg"> 测试图片路径是否正确 -->
            <el-button id="drawRect" class="command-btn" @click="setMode('drawRect')">编辑矩形边框</el-button>
            <el-button id="pan" class="command-btn" @click="setMode('pan')">平移模式</el-button>
            <div id="map"></div>
        </el-main>
        <el-aside width="420px">
            <el-card shadow="always" id="editBoxData" style="width: 400px; margin-top: 20px">
                <div slot="header">
                    <span>当前边框</span>
                </div>
                <el-table :data="editingBoxData" style="width: 100%">
                    <el-table-column
                        prop="id"
                        label="序号"
                        width="80">
                    </el-table-column>
                    <el-table-column
                        prop="xRange"
                        label="横轴坐标范围"
                        width="150">
                    </el-table-column>
                    <el-table-column
                        prop="yRange"
                        label="竖轴坐标范围"
                        width="150">
                    </el-table-column>
                </el-table>
                <el-form :inline="true" style="margin-top: 20px">
                    <el-form-item label="目标名">
                        <el-input v-model="editingBoxData[0].bndBoxName" 
                        placeholder="请输入标注目标名称"
                        @keyup.enter.prevent></el-input>
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
                <el-table :data="bndBoxData" style="width: 100%; margin-bottom: 25px;">
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
                        label="横轴坐标范围"
                        width="85">
                    </el-table-column>
                    <el-table-column
                        prop="yRange"
                        label="竖轴坐标范围"
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
                                <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
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

// 数据对象
var data = function() {
    return {
        imgWidth: 4256,
        imgHeight: 2832,
        imgSrc: require("../../../static/img/test01.jpeg"),
        // imgSrc: './test02.jpeg',
        gMap: "",
        editingBoxData: [{
            id: "3",
            bndBoxName: "",
            xRange: "(111, 222)",
            yRange: "(332, 11)"
        }],
        bndBoxData: [{ //已标注好的边框数据
            id: "0",
            bndBoxName: "山",
            xRange: "(10, 23)",
            yRange: "(20, 44)"
        }]
    }
}

var props= {
    mode:{
        type: String,
        default: ""
    },
    // imgSrc: {
    //     type: String,
    //     default: ""
    // }
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

    // 确认标注边框数据，将当前编辑框数据加入已标注好数据列表中
    handleConfirmMark: function(){
        if (this.editingBoxData[0].bndBoxName === ""){
            this.$message.error('请输入标记目标名称！');
        }else{
            this.bndBoxData.push(this.editingBoxData[0]);
            console.log(this.bndBoxData);
            this.editingBoxData[0] = {
                id: "",
                bndBoxName: "",
                xRange: [],
                yRange: []
            }
        }
    },

    // 删除某行已标注边框数据
    handleDelete: function(rowId){
        console.log(rowId);
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
        // 注意：这里的坐标系原点为图片的中心点
        // 组件封装之后imgWidth和height应该在computed属性中定义
        this.imgWidth = 4256;
        this.imgHeight = 2832;
        let gFeatureStyle = {};
        // this.imgSrc = '../../../static/img/test01.jpeg'; //图片路径，应该从父组件中获得
        // this.imgSrc = './test02.jpeg'

        // 容器对象声明
        // cx, cy：初始中心点坐标
        // autoPan: 绘制过程中是否允许自动平移
        // autoZoom：绘制过程中是否允许自动滚轮缩放
        let gMapObj = new AILabel.Map('map', {
            zoom: this.imgWidth * 2, 
            cx: 0, cy: 0, 
            zoomMax: this.imgWidth * 10, zoomMin: this.imgWidth / 10, 
            autoPan: true, drawZoom: true
        });
        this.gMap = gMapObj;

        // 缩放比例尺 左上角
        const scaleControl = new AILabel.Control.Scale(
            'scale-control-id',
            {postion: {left: 10, top: 10}}
        );
        this.gMap.addControl(scaleControl);
        
        // 图片层实例添加
        let gImageLayer = new AILabel.Layer.Image('img', this.imgSrc, 
            {w: this.imgWidth, h: this.imgHeight},
            {zIndex: 1})
        // let gImageLayer = new AILabel.Layer.Image('img', require("./test02.jpeg"), 
        //     {w: this.imgWidth, h: this.imgHeight},
        //     {zIndex: 1});
        // gImageLayer.renew();
        gMapObj.addLayer(gImageLayer);
        console.log("gimagelayer", gImageLayer);
        // this.gMap.addLayer(gImageLayer);

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

        // 以下是对矩形边框绘制的监听
        // 矩形边框绘制完成
        this.gMap.events.on('geometryDrawDone', function (type, points) {
            //console.log("draw done");
            // 生成元素唯一标志（时间戳）
            const timestamp = new Date().getTime();
            // 元素添加展示
            let fea = new AILabel.Feature.Rect(`feature-${timestamp}`, points, {
                name: ''
            }, gFeatureStyle);
            gFeatureLayer.addFeature(fea);
            console.log("draw done：矩形框坐标数据", points);
        });

        // 进入编辑模式之后，编辑边框完成
        this.gMap.events.on('geometryEditDone', function (type, activeFeature, points) {
            //console.log("edit done");
            activeFeature.update({points});
            activeFeature.show();
            // 通过points来更新编辑框中的坐标范围数据
            console.log("edit done：矩形框坐标数据", points);
        });

        // feature-reset监听
        this.gMap.events.on('featureStatusReset', function () {
            //console.log("feature status reset");
            this.gMap.mLayer.removeAllMarkers();
        });

        // fixme：这里做一个节流 done
        // ？为什么这里要做编辑中的监听
        // 可以实时变更最右方编辑框中的坐标数据
        this.gMap.events.on('geometryEditing', this.throttle(function (type, feature, points) {
            //console.log("geometry editing", points);
            if (!this.gMap.mLayer) return;
            // 得到选定的边框id
            const marker = this.gMap.mLayer.getMarkerById(`marker-${feature.id}`);
            if (!marker) return; //不存在就返回
            
            const bounds = AILabel.Util.getBounds(points);
            const leftTopPoint = bounds[0]; // 边界坐上角坐标
            marker.update({x: leftTopPoint.x, y: leftTopPoint.y});
        }, 1000));

        // 双击选中编辑矩形框，进入编辑模式
        this.gMap.events.on('featureSelected', function (feature) {
            //console.log("feature selected");
            let cFeature = feature;
            // 删除按钮添加
            const featureBounds = cFeature.getBounds();
            const leftTopPoint = featureBounds[0]; // 边界坐上角坐标
            let deleteMarker = new AILabel.Marker(`marker-${cFeature.id}`,
                {
                    src: '../../assets/delete.png',
                    x: leftTopPoint.x,
                    y: leftTopPoint.y,
                    offset: {
                        x: 0,
                        y: 0
                    },
                    featureId: cFeature.id
                });
            this.gMap.mLayer.addMarker(deleteMarker);
            
            // 监听删除边框事件
            // 删除选定的边框
            deleteMarker.regEvent('click', function () {
                //console.log("delete marker");
                // 执行选中元素删除
                gFeatureLayer.removeFeatureById(this.info.featureId);
                // 对应删除标注层中删除（x）icon
                this.gMap.mLayer.removeAllMarkers();
            });
        });

        window.onresize = function () {
            this.gMap && this.gMap.resize();
        }
    }
}
</script>

<style scoped>
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