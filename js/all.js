// console.log(`apiPath:${apiPath}, token: ${token}`);

// 取得DOM
const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');
const discardAllBtn = document.querySelector('.discardAllBtn');

let productData = [];
let cartData = [];

// 簡單重構
function init(){
    getProductList();
    getCartList();
}

init();

// 取得產品列表
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`).then(function(response){
        // console.log(response.data);
        productData = response.data.products;

        // 顯示產品列表
        renderProductList();
        
    })
}

// 監聽下拉選單
productSelect.addEventListener('change',function(e){
    // console.log(e.target.value);
    const category = e.target.value;
    if(category == '全部'){
        renderProductList();
        return;
    }
    let str = '';
    productData.forEach(function(item){
        if(item.category == category){
            str += mergeProductItem(item);
        }
    })
    productList.innerHTML = str;
})

//顯示產品列表
function renderProductList(){
    let str = '';
        productData.forEach(function(item){
            str += mergeProductItem(item);
        })
    productList.innerHTML = str;
}

//二次重構(消除重複)
function mergeProductItem(item){
    return `<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}"
                alt="">
            <a href="#" id="addCardBtn" class="js-addCart" dataId='${item.id}'>加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
            </li>`
}

//加入購物車(使用外層ul綁定監聽事件)
productList.addEventListener('click',function(e){
    //取消預設值
    e.preventDefault();
    // console.log(e.target);
    //取得按下的商品id
    //console.log(e.target.getAttribute('dataId'));
    let addCartClass = e.target.getAttribute('class');
    if(addCartClass!=='js-addCart'){
        return;
    }
    let productId = e.target.getAttribute('dataId');
    //console.log(productId);
    
    //預設加入數量為1
    let numCheck = 1;
    cartData.forEach(function(item){
        //確認購物車裡是否有此品項
        if(item.product.id == productId){
            numCheck = item.quantity += 1;
            
        }
    })
    //console.log(numCheck);
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }
    }).then(function(response){
        //console.log(response);
        //更新資訊後要重新render
        getCartList();

        //alert('加入購物車成功!')
        
    })


})


//coding時可不用過度重構
function getCartList(){

    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`).then(function(response){
        //計算總金額
        //console.log(response.data.finalTotal);
        document.querySelector('.js-total').textContent = response.data.finalTotal;
        
        //取得購物車內資訊
        cartData = response.data.carts;
        let str = '';
        cartData.forEach(function(item){
            str += `<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" dataId="${item.id}">
                    clear
                </a>
            </td>
        </tr>
            `
        });
        
        cartList.innerHTML = str;
    })

}

//刪除單筆購物車
cartList.addEventListener('click',function(e){
    e.preventDefault();
    //console.log(e.target);
    const cartId = e.target.getAttribute('dataId');
    if(cartId == null){
        //alert('你點到其他東西了~')
        return;
    }
    //console.log(cartId);

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartId}`).then(function(response){

        alert('刪除資料成功~');
        getCartList();
    })
    
})

//刪除全部購物車
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();

    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`).then(function(response){

        alert('刪除全部購物車成功!');
        
        getCartList();
    })
    //錯誤判斷(重複點選刪除全部)
    .catch(function(response){
        alert('購物車已清空~');
    })
})

//驗證預定資料是否寫正確
//取得欄位id
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault(); //取消默認行為，用JS進行傳送
    
    //驗證購物車中是否有資料(前後端都要寫驗證)
    if(cartData.length == 0){
        alert('請加入商品');
        return;
    }
    //因抓取id，要用#
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;

    //console.log(customerName,customerPhone,customerEmail,customerAddress,tradeWay);
    
    if(customerName=='' || customerPhone=='' || customerEmail=='' || customerAddress=='' ||tradeWay==''){
        alert('請輸入訂單資訊');
        return;
    }


    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,{

        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": tradeWay
            }
          }
    }).then(function(response){
        alert('訂單送出成功');
        getCartList();

        //清空預定資料欄位
        document.querySelector('#customerName').value='';
        document.querySelector('#customerPhone').value='';
        document.querySelector('#customerEmail').value='';
        document.querySelector('#customerAddress').value='';
        document.querySelector('#tradeWay').value='ATM';
    })

})


