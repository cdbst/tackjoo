const common = require('../common/common.js');
const parser_common = require('./page_parser_common');


function parse_kakaopay_prepare_payload_from_checkout_page($){

    let amount = parser_common.get_data_tag_value($, 'strong', 'data-retail-price');
    if(amount == undefined) return undefined;

    let name = parser_common.get_data_tag_value($, 'a', 'data-eng-name'); // product name
    if(name == undefined) return undefined;

    let el_merchant_uid = parser_common.get_data_tag_elem($, 'input', 'name', 'cartId'); // product name
    if(el_merchant_uid == undefined) return undefined;
    
    let merchant_uid = parser_common.get_elem_attr_value(el_merchant_uid, 'value');
    if(merchant_uid == undefined) return undefined;
    merchant_uid += '_' + new Date().getTime();

    let user_code = parser_common.get_data_tag_value($, 'div', 'data-identity-code');
    if(user_code == undefined) return undefined;
    
    let buyer_name = parser_common.get_data_tag_value($, 'dd', 'data-name');
    if(buyer_name == undefined) return undefined;

    let buyer_email = parser_common.get_data_tag_value($, 'dd', 'data-email');
    if(buyer_email == undefined) return undefined;

    let buyer_tel = parser_common.get_data_tag_value($, 'dd', 'data-phone');
    if(buyer_tel == undefined) return undefined;

    let buyer_addr = parser_common.get_data_tag_value($, 'span', 'data-address');
    if(buyer_addr == undefined) return undefined;

    let buyer_postcode = parser_common.get_data_tag_value($, 'span', 'data-zipcode');
    if(buyer_postcode == undefined) return undefined;

    let payload = {
        amount : amount,
        name : name,
        merchant_uid : merchant_uid,
        user_code : user_code,
        buyer_name : buyer_name,
        buyer_email : buyer_email,
        buyer_tel : buyer_tel,
        buyer_addr : buyer_addr,
        buyer_postcode : buyer_postcode
    };

    payload = set_const_kakaopay_prepare_payload(payload);
    return payload;
}

function parse_payco_prepare_payload_from_checkout_page($){

    let amount = parser_common.get_data_tag_value($, 'strong', 'data-retail-price');
    if(amount == undefined) return undefined;

    let name = parser_common.get_data_tag_value($, 'a', 'data-eng-name'); // product name
    if(name == undefined) return undefined;

    let el_merchant_uid = parser_common.get_data_tag_elem($, 'input', 'name', 'cartId'); // product name
    if(el_merchant_uid == undefined) return undefined;

    let merchant_uid = parser_common.get_elem_attr_value(el_merchant_uid, 'value');
    if(merchant_uid == undefined) return undefined;
    merchant_uid += '_' + new Date().getTime();

    let user_code = parser_common.get_data_tag_value($, 'div', 'data-identity-code');
    if(user_code == undefined) return undefined;

    let buyer_name = parser_common.get_data_tag_value($, 'dd', 'data-name');
    if(buyer_name == undefined) return undefined;

    let buyer_email = parser_common.get_data_tag_value($, 'dd', 'data-email');
    if(buyer_email == undefined) return undefined;

    let buyer_tel = parser_common.get_data_tag_value($, 'dd', 'data-phone');
    if(buyer_tel == undefined) return undefined;

    let buyer_addr = parser_common.get_data_tag_value($, 'span', 'data-address');
    if(buyer_addr == undefined) return undefined;

    let buyer_postcode = parser_common.get_data_tag_value($, 'span', 'data-zipcode');
    if(buyer_postcode == undefined) return undefined;


    const payload = {
        channel: 'pc',
        provider: 'payco',
        pay_method: 'card',
        amount: amount,
        name: name,
        merchant_uid: merchant_uid,
        user_code: user_code,
        pg_id: 'IM_4AKE96',
        buyer_name: buyer_name,
        buyer_email: buyer_email,
        buyer_tel: buyer_tel,
        buyer_addr: buyer_addr,
        buyer_postcode: buyer_postcode,
        request_id: 'req_' + (new Date().getTime()),
        origin: common.NIKE_URL + '/kr/launch/checkout',
        m_redirect_url: common.NIKE_URL + '/kr/launch/checkout/iamport-checkout/hosted/return',
        notice_url: 'https://bill-breeze.nike.co.kr/kr/ko_kr/checkout/iamport-checkout/notification'
    };

    return payload;
}

function set_const_kakaopay_prepare_payload(payload){

    let request_id = 'req' + '_' + new Date().getTime();
    let pg_id = 'CA00004A62';
    let channel = 'pc';
    let provider = 'kakaopay';
    let pay_method = 'card';
    let origin = common.NIKE_URL + '/kr/launch/checkout';
    let m_redirect_url = common.NIKE_URL + '/kr/launch/checkout/iamport-checkout/hosted/return';
    let notice_url = 'https://bill-breeze.nike.co.kr/kr/ko_kr/checkout/iamport-checkout/notification';

    let const_payload = {
        request_id : request_id,
        pg_id : pg_id,
        channel : channel,
        provider : provider,
        pay_method : pay_method,
        origin : origin,
        m_redirect_url : m_redirect_url,
        notice_url : notice_url,
        '_extra[version]' : '1.1.4',
        '_extra[bypass][acceptmethod]' : 'SKIN(#111)'
    }

    return common.merge_object(payload, const_payload);
}



module.exports.parse_kakaopay_prepare_payload_from_checkout_page = parse_kakaopay_prepare_payload_from_checkout_page;
module.exports.parse_payco_prepare_payload_from_checkout_page = parse_payco_prepare_payload_from_checkout_page;