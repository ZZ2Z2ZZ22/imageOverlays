<template>
  <div class="home">
    <div class="left">左边</div>
    <div class="middle">main</div>
    <div class="right">右边</div>
  </div>
</template>

<script>
export default {
  name: "Home"
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
  background-color:red;
}
.right{
  height:100%;
  background-color:yellow;
}
.middle{
  flex:1;
  height:100%;
  background-color:blue;
}
</style>