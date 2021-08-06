//console.log(`hello，admin`);
let orderData = [];
const orderList = document.querySelector('.js-orderList');

//初始化
function init(){
  getOrderList();
}

init();
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, {
    headers: {
      'Authorization': token,
    }
  }).then(function (response) {
    //console.log(response.data);
    orderData = response.data.orders;

    let str = '';
    orderData.forEach(function (item) {
      //組時間字串(new Date 13碼)
      const timeStamp = new Date(item.createdAt*1000);
      const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
      console.log(orderTime);
      
      //組產品字串
      let productStr ='';
      item.products.forEach(function(productItem){
        productStr +=`<p>${productItem.title} x${productItem.quantity}</p>`
      })
      //判斷訂單處理狀態
      let orderStatus = '';
      if(item.paid==true){
        orderStatus = '已處理';      
      }else{
        orderStatus = '未處理';
      }
      //組訂單字串
      str += `<tr>
      <td>${item.id}</td>
      <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
          ${productStr}
      </td>
      <td>${orderTime}</td>
      <td class="js-orderStatus">
          <a href="#" data-status="${item.paid}" data-id="${item.id}" class="orderStatus">${orderStatus}</a>
      </td>
      <td>
          <input type="button" class="delSingleOrder-Btn js-orderDelete" dataId="${item.id}" value="刪除">
      </td>
      </tr>`
    })

  orderList.innerHTML = str;  
  renderC3();
  })
}

orderList.addEventListener('click',function(e){
  e.preventDefault();
  const targetClass = e.target.getAttribute('class');
  let id = e.target.getAttribute('data-id');

  if(targetClass == 'delSingleOrder-Btn js-orderDelete'){
    //alert('點到刪除');
    let id = e.target.getAttribute('dataId');
    console.log(id);
    //console.log(e.target);
    deleteOrderItem(id);
    return;
  }
  if(targetClass == 'orderStatus'){
    //console.log(e.target.textContent);
    let status = e.target.getAttribute('data-status');
    console.log(id);
    
    updateOrderItem(status,id);
    return;
  }

})

function updateOrderItem(status,id){
  //console.log(status,id);

  //更改訂單狀態
  let newStatus;
  if(status == 'true'){
    newStatus = false;
  }else{
    newStatus = true;
  }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, {
    "data": {
      "id": id,
      "paid": newStatus
    }
  } ,{
    headers: {
      'Authorization': token,
    }
  }).then(function(response){
      alert('修改狀態成功');
      getOrderList();
  })
}

function deleteOrderItem(id){
  console.log(id);

  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders/${id}`, {
    headers: {
      'Authorization': token,
    }
  }).then(function(response){
    alert('刪除該筆訂單成功');
    getOrderList();
  })
  
}
// 加入C3.js
function renderC3(){
  //console.log(orderData);
  //物件資料蒐集
  let total = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      item.products.forEach(function(productItem){
        if(total[productItem.category]==undefined){
          total[productItem.category] = productItem.price * productItem.quantity;
        }else{
          total[productItem.category] += productItem.price * productItem.quantity;
        }
      })
    })
  })
  //console.log(total);
  //做出資料關聯
  let categoryAry = Object.keys(total);
  //console.log(categoryAry);
  let newData = [];
  categoryAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  })
  //console.log(newData);
  

  let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
        
    },
});
}

//刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`, {
    headers: {
      'Authorization': token,
    }
  }).then(function(response){
    alert('刪除全部訂單成功');
    getOrderList();
  })
})



