<template>
  <div class="home">
    <div class="left">左边</div>
    <div class="middle">
      <MarkImage></MarkImage>
    </div>
  </div>
</template>

<script>
import MarkImage from './MarkImage'

export default {
  name: "Home",
  components:{
    MarkImage
  }
}
</script>

<style scoped>
.el-header, .el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.home{
  display:flex;
  height:100%;
  width:100%;
  padding:0;
  margin:0;

}
.left{
  height:100%;
  /* background-color:red; */
}
.middle{
  flex:1;
  height:100%;
  /* background-color:blue; */
}