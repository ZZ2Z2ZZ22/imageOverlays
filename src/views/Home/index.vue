<template>
  <div class="home">
    <div class="left">
      <div class="picBar">
        <el-upload
            class="upload-demo"
            action=""
            accept="image/jpeg,image/png"
            :multiple="true"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :before-upload="beforeUpload"
            :auto-upload="false">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
        </el-upload>
      </div>

      <div class="boxType">
        <span>标注边框形状</span>
        <div class="type">
          <el-button class="typeButton" v-for="type in types" :key="type.name" @click="chooseType(type.value)">
            {{type.name}}
          </el-button>
        </div>
      </div>
    </div>
    <div class="middle">
     <MarkImage :img="picSrc.src" :mode="mode"></MarkImage>
    </div>
  </div>
</template>

<script>
import MarkImage from './MarkImage'

export default {
  name: "Home",
  components: {
    MarkImage
  },
  data() {
    return {
      types:[
        {name:'矩形', value: "drawRect"},
        {name:'圆形', value: ""},
        {name:'椭圆', value: ""},
        {name:'菱形', value: ""},
      ],
      mode:'',
      picSrc: {name:'',src:''},
      picVisible: false
    };
  },
  methods: {

    //删除图片
    handleRemove(file) {
      if(file.name==this.picSrc.name){
        this.picSrc.src='';
        this.picSrc.name='';
        this.picVisible=false;
      }
    },

    // 导入图片后 Base64编码图片
    handlePreview(file) {
      if(this.beforeUpload(file)){
        const reader = new FileReader();
        reader.readAsDataURL(file.raw);
        let that=this;
        reader.onload=function(){
          that.picVisible=true;
          that.picSrc.src=reader.result;
          that.picSrc.name=file.name;
       }
      }

    },

    beforeRemove(file) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },

    //图片导入大小、格式限制
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'||'image/png';
      // const isLt4M = file.size / 1024 / 1024 < 4;
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!');
      }
      // if (!isLt4M) {
      //   this.$message.error('上传图片大小不能超过 4MB!');
      // }
      return isJPG;
    },

    //选择标注框形状
    chooseType(name){
      this.mode=name;
    },
  },
}
</script>

<style scoped>
.home{
  display:flex;
  height:100%;
  width:100%;
  padding:0;
  margin:0;
}
.left{
  width:20vw;
  background-color:white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  border:1px solid #E4E7ED;
}
.middle{
  flex:1;
  background-color:white;
}
.picBar{
  margin-bottom:5px;
  border:1px solid black;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
.boxType{
  border:1px solid black;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
.boxType span{
  background-color:#E4E7ED;
  display:block;
  line-height:5vh;
}
.boxType .type{
  overflow:hidden;
  display:flex;
  flex-flow: row wrap;
  align-content: center;
}
.type .typeButton{
  float:left;
  /* display:inline-block; */
  margin:1vh 1vw;
}
</style>
