import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  TextInput, Image, Modal, Platform, useWindowDimensions,
  KeyboardAvoidingView, Animated, Dimensions, Switch, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

// ─── COLORS ────────────────────────────────────────────────────────
const C = {
  blue:'#2374E1', blueDark:'#1A5FBD', blueLight:'#283A52',
  bg:'#18191A', card:'#242526', text:'#E4E6EB', sub:'#B0B3B8',
  border:'#3E4042', div:'#3E4042', hover:'#3A3B3C',
  green:'#31A24C', red:'#FA3E3E', yellow:'#F7B928',
};

const REACTIONS = [
  {key:'👍',label:'Thích',color:'#1877F2'},
  {key:'❤️',label:'Yêu thích',color:'#F33E58'},
  {key:'😂',label:'Haha',color:'#F7B928'},
  {key:'😮',label:'Wow',color:'#F7B928'},
  {key:'😢',label:'Buồn',color:'#F7B928'},
  {key:'😡',label:'Phẫn nộ',color:'#E9710F'},
];
const QUICK_EMOJIS = ['❤️','😂','😮','😢','🎉','🙏','💯','🔥','✨','😍','👏','🥳'];

// ─── MOCK DATA ──────────────────────────────────────────────────────
const USERS = [
  {id:'u1',name:'Nguyễn Văn An',    ava:'https://i.pravatar.cc/150?img=11',cover:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',bio:'Yêu cuộc sống & thiên nhiên 🌿',work:'Google Vietnam',school:'ĐHBK TP.HCM',city:'TP.HCM',mutual:5, friend:true, online:true},
  {id:'u2',name:'Trần Thị Bình',    ava:'https://i.pravatar.cc/150?img=5', cover:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',bio:'Cà phê ☕ · Code 💻 · Âm nhạc 🎵',work:'VNG Corp',school:'ĐH FPT',city:'Hà Nội',mutual:12,friend:true, online:true},
  {id:'u3',name:'Lê Minh Châu',     ava:'https://i.pravatar.cc/150?img=15',cover:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',bio:'Du lịch là đam mê 🌍',work:'Freelancer',school:'RMIT VN',city:'Đà Nẵng',mutual:3, friend:false,online:false},
  {id:'u4',name:'Phạm Hồng Đức',   ava:'https://i.pravatar.cc/150?img=8', cover:'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=800',bio:'Lập trình viên React Native',work:'Techbase VN',school:'ĐHBK HN',city:'Hải Phòng',mutual:8, friend:false,online:true},
  {id:'u5',name:'Võ Thị Em',        ava:'https://i.pravatar.cc/150?img=20',cover:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',bio:'Nghệ thuật & Âm nhạc 🎵',work:'VinGroup',school:'Nhạc viện TP.HCM',city:'Cần Thơ',mutual:2, friend:true, online:false},
  {id:'u6',name:'Hoàng Văn Phong',  ava:'https://i.pravatar.cc/150?img=33',cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',bio:'Gym & Yoga 💪',work:'Masan Group',school:'ĐHKT TP.HCM',city:'Bình Dương',mutual:7, friend:false,online:true},
  {id:'u7',name:'Nguyễn Thu Hương', ava:'https://i.pravatar.cc/150?img=25',cover:'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=800',bio:'Bếp trưởng nghiệp dư 🍳',work:'Restaurant owner',school:'ĐH Nông Lâm',city:'Vũng Tàu',mutual:4, friend:true, online:true},
];

const STORIES_INIT = [
  {id:'s1',uid:'u1',name:'Nguyễn Văn An',    ava:'https://i.pravatar.cc/150?img=11',img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',caption:'',seen:false},
  {id:'s2',uid:'u2',name:'Trần Thị Bình',    ava:'https://i.pravatar.cc/150?img=5', img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',caption:'Code xong rồi 🎉',seen:false},
  {id:'s3',uid:'u5',name:'Võ Thị Em',        ava:'https://i.pravatar.cc/150?img=20',img:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',caption:'Hoàng hôn đẹp ☀️',seen:true},
  {id:'s4',uid:'u3',name:'Lê Minh Châu',     ava:'https://i.pravatar.cc/150?img=15',img:'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=400',caption:'Đà Lạt 🌺',seen:true},
  {id:'s5',uid:'u6',name:'Hoàng Văn Phong',  ava:'https://i.pravatar.cc/150?img=33',img:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',caption:'Gym done! 💪',seen:false},
  {id:'s6',uid:'u7',name:'Nguyễn Thu Hương', ava:'https://i.pravatar.cc/150?img=25',img:'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',caption:'Món mới hôm nay 🍳',seen:false},
];

const POSTS_INIT = [
  {id:'p0',uid:'g0',uname:'Pass đồ sinh viên giá rẻ Hà Nội',uava:'https://i.pravatar.cc/150?img=1',text:'Mình cần tìm ghế ngồi học ạ',img:null,feeling:'',location:'',time:'47 phút',privacy:'👥',react:{'👍':4,'💬':14} as Record<string,number>,myReact:'',comments:[],shares:0,saved:false,poll:null as any, bgColor:'#E42939', textColor:'#FFFFFF', isGroup:true},
  {id:'p1',uid:'u1',uname:'Nguyễn Văn An',uava:'https://i.pravatar.cc/150?img=11',text:'Sáng nay thức dậy thấy bầu trời đẹp quá, cuộc sống thật tuyệt vời! ☀️🌸\n\nMỗi ngày là một món quà mới, hãy sống thật trọn vẹn nhé mọi người!',img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',feeling:'😊 đang cảm thấy tuyệt vời',location:'',time:'2 giờ trước',privacy:'🌐',react:{'👍':24,'❤️':15,'😮':3} as Record<string,number>,myReact:'',comments:[{id:'c1',uid:'u2',name:'Trần Thị Bình',ava:'https://i.pravatar.cc/150?img=5',text:'Đẹp quá trời! 😍',time:'1 giờ',likes:5,liked:false,replies:[{id:'r1',name:'Nguyễn Văn An',ava:'https://i.pravatar.cc/150?img=11',text:'Cảm ơn bạn nhé! 😊',time:'45 phút'}]},{id:'c2',uid:'u5',name:'Võ Thị Em',ava:'https://i.pravatar.cc/150?img=20',text:'Buổi sáng như thế này mà được đi dạo thì tuyệt! 🥲',time:'45 phút',likes:2,liked:false,replies:[]}],shares:7,saved:false,poll:null as any},
  {id:'p2',uid:'u2',uname:'Trần Thị Bình',uava:'https://i.pravatar.cc/150?img=5',text:'Cuối tuần này team mình đã code xong feature mới cực đỉnh rồi! 🚀\n\nCảm ơn mọi người đã cùng thức khuya nhé. Lần sau sẽ có bữa ăn nhóm xứng đáng hơn! 🍜\n\n#coding #teamwork #developer',img:null,feeling:'🔥 đang có động lực',location:'',time:'4 giờ trước',privacy:'🌐',react:{'👍':42,'❤️':8,'😂':3} as Record<string,number>,myReact:'',comments:[{id:'c3',uid:'u3',name:'Lê Minh Châu',ava:'https://i.pravatar.cc/150?img=15',text:'Giỏi quá! Thức khuya vì đam mê mới là đỉnh 😎',time:'3 giờ',likes:8,liked:false,replies:[{id:'r2',name:'Trần Thị Bình',ava:'https://i.pravatar.cc/150?img=5',text:'Cảm ơn bạn 😊',time:'2 giờ'}]}],shares:12,saved:false,
    poll:{question:'Bạn thích tech stack nào nhất?',options:[{text:'React Native',votes:45},{text:'Flutter',votes:28},{text:'Swift/Kotlin',votes:12}],voted:null,total:85}},
  {id:'p3',uid:'u5',uname:'Võ Thị Em',uava:'https://i.pravatar.cc/150?img=20',text:'Chiều nay đi cà phê ngắm hoàng hôn, trời đất ơi đẹp không tả được 🌇\n\nLife is beautiful! 🧡',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',feeling:'🌅 đang ngắm hoàng hôn',location:'📍 Landmark 81, TP.HCM',time:'5 giờ trước',privacy:'🌐',react:{'👍':63,'❤️':29,'😮':5,'😢':2} as Record<string,number>,myReact:'',comments:[{id:'c4',uid:'u1',name:'Nguyễn Văn An',ava:'https://i.pravatar.cc/150?img=11',text:'Wow đẹp thật! Hôm nào cho mình đi cùng với 😊',time:'4 giờ',likes:12,liked:false,replies:[]}],shares:18,saved:false,poll:null},
  {id:'p4',uid:'u3',uname:'Lê Minh Châu',uava:'https://i.pravatar.cc/150?img=15',text:'📍 Đà Lạt - Thành phố ngàn hoa\n\nVừa đặt vé cho chuyến đi Đà Lạt tuần tới! Ai muốn đi cùng thì PM mình nha 🌺🍓\n\nDự kiến: 3 ngày 2 đêm, budget ~2-3 triệu/người',img:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',feeling:'✈️ đang lên kế hoạch du lịch',location:'📍 Đà Lạt, Lâm Đồng',time:'1 ngày trước',privacy:'🌐',react:{'👍':88,'❤️':45,'😮':12,'😂':5} as Record<string,number>,myReact:'',comments:[{id:'c5',uid:'u1',name:'Nguyễn Văn An',ava:'https://i.pravatar.cc/150?img=11',text:'Đi đi! Mình đăng ký ngay! 🙋',time:'23 giờ',likes:15,liked:false,replies:[{id:'r3',name:'Lê Minh Châu',ava:'https://i.pravatar.cc/150?img=15',text:'Ok bạn! PM mình nhé 😊',time:'22 giờ'}]},{id:'c6',uid:'u7',name:'Nguyễn Thu Hương',ava:'https://i.pravatar.cc/150?img=25',text:'Đà Lạt tháng này đẹp lắm! Nhớ ghé bánh mì Phượng nhé 🥖',time:'20 giờ',likes:8,liked:false,replies:[]}],shares:23,saved:false,poll:null},
  {id:'p5',uid:'u7',uname:'Nguyễn Thu Hương',uava:'https://i.pravatar.cc/150?img=25',text:'🍳 Hôm nay thử công thức mới: Phở bò nam bộ!\n\nKết quả: ĐỈNH THẬT! Nước dùng trong vắt, thơm lừng cả nhà 😍\n\n#cooking #pho #homemade #vietnamesefood',img:'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',feeling:'🍜 đang nấu ăn',location:'📍 Nhà bếp thân yêu',time:'2 ngày trước',privacy:'🌐',react:{'👍':156,'❤️':89,'😂':12,'😮':34} as Record<string,number>,myReact:'',comments:[{id:'c7',uid:'u2',name:'Trần Thị Bình',ava:'https://i.pravatar.cc/150?img=5',text:'Trời ơi nhìn thèm quá! 🤤',time:'2 ngày',likes:22,liked:false,replies:[]}],shares:45,saved:false,poll:null},
];

const MSGS_INIT = [
  {id:'m1',uid:'u1',name:'Nguyễn Văn An',    ava:'https://i.pravatar.cc/150?img=11',last:'Tối nay đi ăn không? 🍜',time:'5 phút',unread:2,online:true},
  {id:'m2',uid:'u2',name:'Trần Thị Bình',    ava:'https://i.pravatar.cc/150?img=5', last:'Code xong rồi nhé 🚀',time:'1 giờ',unread:0,online:true},
  {id:'m3',uid:'u5',name:'Võ Thị Em',        ava:'https://i.pravatar.cc/150?img=20',last:'Bức ảnh đẹp không? 😍',time:'3 giờ',unread:1,online:false},
  {id:'m4',uid:'u3',name:'Lê Minh Châu',     ava:'https://i.pravatar.cc/150?img=15',last:'Đi Đà Lạt chưa?',time:'1 ngày',unread:0,online:false},
  {id:'m5',uid:'u7',name:'Nguyễn Thu Hương', ava:'https://i.pravatar.cc/150?img=25',last:'Nhìn thèm quá 😍',time:'2 ngày',unread:0,online:true},
];

const CHAT_INIT:Record<string,any[]> = {
  u1:[{id:'x1',text:'Hey! Lâu rồi không gặp 😊',mine:false,time:'10:30',seen:true},{id:'x2',text:'Ừ! Dạo này bạn khoẻ không?',mine:true,time:'10:32',seen:true},{id:'x3',text:'Tối nay đi ăn không? 🍜',mine:false,time:'10:35',seen:false}],
  u2:[{id:'x4',text:'Bạn ơi review PR mình với 🙏',mine:false,time:'Hôm qua',seen:true},{id:'x5',text:'Ok mình xem ngay!',mine:true,time:'Hôm qua',seen:true},{id:'x6',text:'Code xong rồi nhé 🚀',mine:false,time:'1 giờ',seen:false}],
};

const NOTIFS_INIT = [
  {id:'n1',type:'like',   actor:'Nguyễn Văn An',    ava:'https://i.pravatar.cc/150?img=11',text:'đã thích ảnh của bạn',img:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=60',time:'5 phút',read:false},
  {id:'n2',type:'comment',actor:'Trần Thị Bình',    ava:'https://i.pravatar.cc/150?img=5', text:'đã bình luận: "Tuyệt vời! 👏"',img:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=60',time:'30 phút',read:false},
  {id:'n3',type:'friend', actor:'Phạm Hồng Đức',   ava:'https://i.pravatar.cc/150?img=8', text:'đã gửi lời mời kết bạn',img:'',time:'2 giờ',read:false},
  {id:'n4',type:'accept', actor:'Nguyễn Thu Hương', ava:'https://i.pravatar.cc/150?img=25',text:'đã chấp nhận lời mời kết bạn',img:'',time:'3 giờ',read:false},
  {id:'n5',type:'like',   actor:'Võ Thị Em',        ava:'https://i.pravatar.cc/150?img=20',text:'và 8 người khác đã thích ảnh',img:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=60',time:'5 giờ',read:true},
  {id:'n6',type:'tag',    actor:'Lê Minh Châu',     ava:'https://i.pravatar.cc/150?img=15',text:'đã nhắc đến bạn trong bình luận',img:'',time:'1 ngày',read:true},
  {id:'n7',type:'bday',   actor:'Hoàng Văn Phong',  ava:'https://i.pravatar.cc/150?img=33',text:'có sinh nhật hôm nay 🎂 Gửi lời chúc nhé!',img:'',time:'1 ngày',read:true},
  {id:'n8',type:'group',  actor:'Nhóm Dev Vietnam', ava:'https://i.pravatar.cc/150?img=44',text:'có 3 bài đăng mới mà bạn chưa xem',img:'',time:'2 ngày',read:true},
];

const GROUPS_INIT = [
  {id:'g1',name:'Dev Vietnam 🇻🇳',cover:'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',ava:'https://i.pravatar.cc/150?img=44',members:'24.5K',type:'public',joined:true,newPosts:3},
  {id:'g2',name:'Ẩm thực Việt Nam',cover:'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',ava:'https://i.pravatar.cc/150?img=55',members:'156K',type:'public',joined:true,newPosts:12},
  {id:'g3',name:'Du lịch Việt Nam 🌏',cover:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',ava:'https://i.pravatar.cc/150?img=56',members:'89K',type:'public',joined:false,newPosts:0},
  {id:'g4',name:'Hội yêu cà phê',cover:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',ava:'https://i.pravatar.cc/150?img=57',members:'45K',type:'public',joined:false,newPosts:0},
  {id:'g5',name:'Gym & Fitness VN',cover:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',ava:'https://i.pravatar.cc/150?img=58',members:'32K',type:'public',joined:true,newPosts:5},
];

const MARKETPLACE_INIT = [
  {id:'i1',title:'iPhone 15 Pro Max 256GB',price:'28.000.000đ',img:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',location:'Quận 1, TP.HCM',time:'1 giờ trước',seller:'Nguyễn Văn An',condition:'Mới 99%'},
  {id:'i2',title:'Xe máy Honda Wave Alpha 2022',price:'18.500.000đ',img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',location:'Bình Thạnh, TP.HCM',time:'2 giờ trước',seller:'Trần Thị Bình',condition:'Đã qua sử dụng'},
  {id:'i3',title:'Laptop MacBook Air M2',price:'25.000.000đ',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',location:'Cầu Giấy, Hà Nội',time:'3 giờ trước',seller:'Lê Minh Châu',condition:'Mới 95%'},
  {id:'i4',title:'Bộ bàn ghế gỗ phòng ngủ',price:'4.500.000đ',img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',location:'Thủ Đức, TP.HCM',time:'5 giờ trước',seller:'Võ Thị Em',condition:'Đã qua sử dụng'},
  {id:'i5',title:'Máy ảnh Sony A7III + lens',price:'35.000.000đ',img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',location:'Đống Đa, Hà Nội',time:'1 ngày trước',seller:'Phạm Hồng Đức',condition:'Mới 98%'},
  {id:'i6',title:'Tủ lạnh Samsung 400L',price:'8.200.000đ',img:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400',location:'Bình Định',time:'1 ngày trước',seller:'Hoàng Văn Phong',condition:'Đã qua sử dụng'},
];

const EVENTS_INIT = [
  {id:'e1',title:'Meetup Dev Việt Nam Tháng 7',date:'Thứ 6, 18 tháng 7 · 18:00',location:'Toong Coworking, Q.1 TP.HCM',img:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',going:128,interested:245,status:'interested',organizer:'Dev Vietnam Community'},
  {id:'e2',title:'Lễ hội Ẩm thực Đường phố 2024',date:'Thứ 7, 20 tháng 7 · 09:00',location:'Công viên Tao Đàn, TP.HCM',img:'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600',going:1240,interested:3421,status:'going',organizer:'TP.HCM Tourism'},
  {id:'e3',title:'Concert: Hà Anh Tuấn - Từ Đó',date:'Chủ nhật, 28 tháng 7 · 19:00',location:'SVĐ Phú Thọ, TP.HCM',img:'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600',going:4500,interested:12300,status:null,organizer:'HAT Production'},
  {id:'e4',title:'Tech Talk: AI & Machine Learning',date:'Thứ 4, 24 tháng 7 · 14:00',location:'ĐH Bách Khoa TP.HCM',img:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',going:89,interested:234,status:null,organizer:'Google Developer Group'},
];

const REELS_INIT = [
  {id:'r1',uid:'u5',uname:'Võ Thị Em',uava:'https://i.pravatar.cc/150?img=20',thumb:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=700&fit=crop',caption:'Hoàng hôn Landmark 81 đẹp quá 🌇 #sunset #saigon #lifestyle',likes:1234,comments:89,shares:45,sound:'Nhạc chill buổi tối',playing:false},
  {id:'r2',uid:'u7',uname:'Nguyễn Thu Hương',uava:'https://i.pravatar.cc/150?img=25',thumb:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=700&fit=crop',caption:'Phở bò nam bộ ngon nhất Sài Gòn 🍜 #cooking #pho #food',likes:8765,comments:234,shares:156,sound:'Cooking ASMR',playing:false},
  {id:'r3',uid:'u3',uname:'Lê Minh Châu',uava:'https://i.pravatar.cc/150?img=15',thumb:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=700&fit=crop',caption:'Đà Lạt mù sương sáng sớm 🌺✨ #dalat #travel #morning',likes:5432,comments:167,shares:89,sound:'Nhạc Đà Lạt',playing:false},
  {id:'r4',uid:'u6',uname:'Hoàng Văn Phong',uava:'https://i.pravatar.cc/150?img=33',thumb:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=700&fit=crop',caption:'Buổi sáng gym cực cháy 💪🔥 #gym #fitness #workout',likes:3210,comments:98,shares:34,sound:'Nhạc tập gym',playing:false},
];

const SAVED_INIT = [
  {id:'sv1',collection:'Tất cả',items:POSTS_INIT.slice(0,2)},
];

const FEELINGS = ['😊 Tuyệt vời','😍 Yêu thích','🥳 Hào hứng','😌 Bình yên','😢 Buồn','😡 Tức giận','🤔 Băn khoăn','🥱 Mệt mỏi','🔥 Có động lực','❤️ Yêu','🤩 Ngạc nhiên','💪 Mạnh mẽ'];
const PHOTOS_GRID = ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300','https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300','https://images.unsplash.com/photo-1518655048521-f130df041f66?w=300','https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300','https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=300','https://images.unsplash.com/photo-1544025162-d76694265947?w=300','https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300'];

type Screen = 'feed'|'friends'|'watch'|'menu'|'notifs'|'messages'|'chat'|'profile'|'search'|'groups'|'group_detail'|'market'|'events'|'reels'|'saved'|'live'|'memories'|'gaming'|'activity';

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function SocialScreen() {
  const router = useRouter();
  const { userName, avatarUrl, bio } = useUser();
  const { width } = useWindowDimensions();
  const isDesk = Platform.OS==='web' && width>600;

  const [screen,    setScreen   ] = useState<Screen>('feed');
  const [posts,     setPosts    ] = useState(POSTS_INIT);
  const [users,     setUsers    ] = useState(USERS);
  const [groups,    setGroups   ] = useState(GROUPS_INIT);
  const [events,    setEvents   ] = useState(EVENTS_INIT);
  const [notifs,    setNotifs   ] = useState(NOTIFS_INIT);
  const [chats,     setChats    ] = useState(CHAT_INIT);
  const [reels,     setReels    ] = useState(REELS_INIT);
  const [savedPosts,setSavedPosts]=useState(POSTS_INIT.filter((_,i)=>i<2));

  const [storyTarget,   setStoryTarget  ] = useState<any>(null);
  const [profileTarget, setProfileTarget] = useState<any>(null);
  const [chatTarget,    setChatTarget   ] = useState<any>(null);
  const [groupTarget,   setGroupTarget  ] = useState<any>(null);
  const [marketItem,    setMarketItem   ] = useState<any>(null);
  const [postMenu,      setPostMenu     ] = useState('');
  const [shareTarget,   setShareTarget  ] = useState<any>(null);

  const [expandedPost,  setExpandedPost ] = useState('');
  const [reactTarget,   setReactTarget  ] = useState('');
  const [commentText,   setCommentText  ] = useState('');
  const [replyInfo,     setReplyInfo    ] = useState<any>(null);

  const [showCreate,  setShowCreate ] = useState(false);
  const [newText,     setNewText    ] = useState('');
  const [newFeeling,  setNewFeeling ] = useState('');
  const [showFeeling, setShowFeeling] = useState(false);
  const [newPollMode, setNewPollMode] = useState(false);
  const [pollQ,       setPollQ      ] = useState('');
  const [pollOpts,    setPollOpts   ] = useState(['','']);

  const [searchQ,   setSearchQ  ] = useState('');
  const [chatMsg,   setChatMsg  ] = useState('');
  const [marketCat, setMarketCat] = useState('Tất cả');
  const [liveMsg,   setLiveMsg  ] = useState('');
  const [liveMsgs,  setLiveMsgs ] = useState<any[]>([{id:'lm1',name:'Nguyễn Văn An',text:'Đang xem đây! 🔥',color:'#FF6B6B'},{id:'lm2',name:'Trần Thị Bình',text:'Hay quá bạn ơi! 👏',color:'#4ECDC4'}]);
  const [liveViewers,setLiveViewers]=useState(1247);
  const [notifFilter,setNotifFilter]=useState<'all'|'unread'>('all');
  const [groupPostText,setGroupPostText]=useState('');
  const [marketSearch,setMarketSearch]=useState('');
  const [curIdx,     setCurIdx    ] = useState(0);  // for Reels

  // profile tabs
  const [profTab,   setProfTab  ] = useState<'posts'|'about'|'photos'|'friends'>('posts');
  const [myProfTab, setMyProfTab] = useState<'posts'|'about'|'photos'|'friends'>('posts');

  const storyAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!storyTarget) return;
    storyAnim.setValue(0);
    Animated.timing(storyAnim,{toValue:1,duration:8000,useNativeDriver:false}).start(({finished})=>{ if(finished) setStoryTarget(null); });
    return ()=>storyAnim.stopAnimation();
  },[storyTarget]);

  const totalR = (r:Record<string,number>) => Object.values(r).reduce((a,b)=>a+b,0);
  const topR   = (r:Record<string,number>) => Object.entries(r).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);

  const react = (pid:string,rkey:string) => {
    setPosts(ps=>ps.map(p=>{
      if(p.id!==pid)return p;
      const r={...p.react};
      if(p.myReact===rkey){r[rkey]--;if(r[rkey]<=0)delete r[rkey];return{...p,react:r,myReact:''};}
      if(p.myReact){r[p.myReact]--;if(r[p.myReact]<=0)delete r[p.myReact];}
      r[rkey]=(r[rkey]||0)+1;
      return{...p,react:r,myReact:rkey};
    }));
    setReactTarget('');
  };

  const addComment=(pid:string)=>{
    if(!commentText.trim())return;
    const now={id:`c${Date.now()}`,uid:'me',name:userName,ava:avatarUrl,text:commentText,time:'Vừa xong',likes:0,liked:false,replies:[]};
    if(replyInfo?.pid===pid){
      setPosts(ps=>ps.map(p=>p.id!==pid?p:{...p,comments:p.comments.map((c:any)=>c.id!==replyInfo.cid?c:{...c,replies:[...(c.replies||[]),{id:`r${Date.now()}`,name:userName,ava:avatarUrl,text:commentText,time:'Vừa xong'}]})}));
      setReplyInfo(null);
    }else{
      setPosts(ps=>ps.map(p=>p.id!==pid?p:{...p,comments:[...p.comments,now]}));
    }
    setCommentText('');
  };

  const likeComment=(pid:string,cid:string)=>setPosts(ps=>ps.map(p=>p.id!==pid?p:{...p,comments:p.comments.map((c:any)=>c.id!==cid?c:{...c,likes:c.liked?c.likes-1:c.likes+1,liked:!c.liked})}));

  const votePoll=(pid:string,optIdx:number)=>{
    setPosts(ps=>ps.map(p=>{
      if(p.id!==pid||!p.poll||p.poll.voted!==null)return p;
      const opts=p.poll.options.map((o:any,i:number)=>i===optIdx?{...o,votes:o.votes+1}:o);
      return{...p,poll:{...p.poll,options:opts,voted:optIdx,total:p.poll.total+1}};
    }));
  };

  const toggleSave=(pid:string)=>{
    const p=posts.find(x=>x.id===pid);
    if(!p)return;
    const already=savedPosts.find(x=>x.id===pid);
    if(already)setSavedPosts(sp=>sp.filter(x=>x.id!==pid));
    else setSavedPosts(sp=>[p,...sp]);
    setPosts(ps=>ps.map(x=>x.id===pid?{...x,saved:!x.saved}:x));
  };

  const sendChat=()=>{
    if(!chatMsg.trim()||!chatTarget)return;
    const msg={id:`m${Date.now()}`,text:chatMsg,mine:true,time:'Vừa xong',seen:false};
    setChats(prev=>({...prev,[chatTarget.id]:[...(prev[chatTarget.id]||[]),msg]}));
    setChatMsg('');
  };

  const sendLiveMsg=()=>{
    if(!liveMsg.trim())return;
    setLiveMsgs(ms=>[...ms,{id:`lm${Date.now()}`,name:userName,text:liveMsg,color:C.blue}]);
    setLiveMsg('');
  };

  const createPost=()=>{
    if(!newText.trim()&&!(newPollMode&&pollQ.trim()))return;
    const poll=newPollMode&&pollQ.trim()?{question:pollQ,options:pollOpts.filter(o=>o.trim()).map(t=>({text:t,votes:0})),voted:null,total:0}:null;
    const p={id:`p${Date.now()}`,uid:'me',uname:userName,uava:avatarUrl,text:newText,img:null,feeling:newFeeling,location:'',time:'Vừa xong',privacy:'🌐',react:{} as Record<string,number>,myReact:'',comments:[],shares:0,saved:false,poll};
    setPosts([p,...posts]);
    setNewText('');setNewFeeling('');setShowCreate(false);setNewPollMode(false);setPollQ('');setPollOpts(['','']);
  };

  const unreadN=notifs.filter(n=>!n.read).length;
  const unreadM=MSGS_INIT.reduce((a,m)=>a+m.unread,0);
  const openProfile=(u:any)=>{setProfileTarget(u);setProfTab('posts');setScreen('profile');};
  const goBack=()=>setScreen('feed');

  const MCAT=['Tất cả','Điện tử','Xe cộ','Đồ gia dụng','Thời trang','Bất động sản'];

  // ─── RENDER ───────────────────────────────────────────────────────
  return (
    <View style={[g.root,isDesk&&g.desk]}>

      {/* TOP NAVBAR */}
      {screen!=='live' && screen!=='reels' && (
        <View style={g.navbar}>
          <View style={g.navL}>
            <View style={g.navLogo}><Text style={g.navLogoTxt}>f</Text></View>
            <TouchableOpacity style={g.navSearchBox} onPress={()=>setScreen('search')}>
              <Text>🔍</Text><Text style={g.navSearchTxt}>Tìm kiếm...</Text>
            </TouchableOpacity>
          </View>
          <View style={g.navC}>
            {([
              {k:'feed'  as Screen,icon:'⊞'},
              {k:'friends' as Screen,icon:'👥'},
              {k:'watch'  as Screen,icon:'▶️'},
            ]).map(t=>(
              <TouchableOpacity key={t.k} style={[g.navTab,screen===t.k&&g.navTabA]} onPress={()=>setScreen(t.k)}>
                <Text style={[g.navTabIcon,screen===t.k&&{color:C.blue}]}>{t.icon}</Text>
                {screen===t.k&&<View style={g.navLine}/>}
              </TouchableOpacity>
            ))}
          </View>
          <View style={g.navR}>
            <TouchableOpacity style={g.navBtn} onPress={()=>setScreen('messages')}>
              <Text style={g.navBtnIcon}>💬</Text>
              {unreadM>0&&<View style={g.navBadge}><Text style={g.navBadgeTxt}>{unreadM}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={g.navBtn} onPress={()=>{setScreen('notifs');setNotifs(n=>n.map(x=>({...x,read:true})));}} >
              <Text style={g.navBtnIcon}>🔔</Text>
              {unreadN>0&&<View style={g.navBadge}><Text style={g.navBadgeTxt}>{unreadN}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity style={[g.navBtn,{padding:0,overflow:'hidden'}]} onPress={()=>setScreen('menu')}>
              <Image source={{uri:avatarUrl}} style={{width:36,height:36,borderRadius:18}}/>
            </TouchableOpacity>
            <TouchableOpacity style={g.navClose} onPress={()=>router.canGoBack()?router.back():router.replace('/')}>
              <Text style={g.navCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {screen==='feed'        && renderFeed()}
      {screen==='friends'     && renderFriends()}
      {screen==='watch'       && renderWatch()}
      {screen==='menu'        && renderMenu()}
      {screen==='notifs'      && renderNotifs()}
      {screen==='messages'    && !chatTarget && renderMsgList()}
      {screen==='messages'    && chatTarget  && renderChat()}
      {screen==='profile'     && renderProfile()}
      {screen==='search'      && renderSearch()}
      {screen==='groups'      && !groupTarget && renderGroups()}
      {screen==='group_detail'&& groupTarget  && renderGroupDetail()}
      {screen==='market'      && !marketItem  && renderMarket()}
      {screen==='market'      && marketItem   && renderMarketDetail()}
      {screen==='events'      && renderEvents()}
      {screen==='reels'       && renderReels()}
      {screen==='saved'       && renderSaved()}
      {screen==='live'        && renderLive()}
      {screen==='memories'    && renderMemories()}
      {screen==='gaming'      && renderGaming()}
      {screen==='activity'    && renderActivity()}

      {storyTarget  != null && renderStoryModal()}
      {showCreate   && renderCreateModal()}
      {!!postMenu   && renderPostMenuModal()}
      {shareTarget  != null && renderShareModal()}
    </View>
  );

  // ═══════════════════════════════════════════════════════════════════
  // FEED
  // ═══════════════════════════════════════════════════════════════════
  function renderFeed() {
    return (
      <ScrollView style={g.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Stories */}
        <View style={f.storiesCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={f.storiesRow}>
            <TouchableOpacity style={f.storyWrap}>
              <View style={f.storyImgBox}>
                <Image source={{uri:avatarUrl}} style={f.storyImg}/>
                <View style={f.storyAddBar}><View style={f.storyAddCircle}><Text style={f.storyAddPlus}>+</Text></View></View>
              </View>
              <Text style={f.storyName}>Thêm tin</Text>
            </TouchableOpacity>
            {STORIES_INIT.map(s=>(
              <TouchableOpacity key={s.id} style={f.storyWrap} onPress={()=>setStoryTarget(s)}>
                <View style={f.storyImgBox}>
                  <Image source={{uri:s.img}} style={f.storyImg}/>
                  <View style={f.storyDark}/>
                  <View style={[f.storyRing,s.seen?f.storyRingSeen:f.storyRingNew]}>
                    <Image source={{uri:s.ava}} style={f.storyAva}/>
                  </View>
                  {s.caption?<Text style={f.storyCaption} numberOfLines={2}>{s.caption}</Text>:null}
                </View>
                <Text style={f.storyName} numberOfLines={1}>{s.name.split(' ').pop()}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Create post */}
        <View style={f.createCard}>
          <View style={f.createRow}>
            <Image source={{uri:avatarUrl}} style={f.createAva}/>
            <TouchableOpacity style={f.createBox} onPress={()=>setShowCreate(true)}>
              <Text style={f.createHint}>Bạn đang nghĩ gì?</Text>
            </TouchableOpacity>
          </View>
          <View style={f.createDiv}/>
          <View style={f.createActions}>
            {[['🎥','Video trực tiếp',()=>setScreen('live')],['🖼️','Ảnh/Video',()=>setShowCreate(true)],['😊','Cảm xúc',()=>setShowCreate(true)]].map(([ic,lb,cb]:any)=>(
              <TouchableOpacity key={lb} style={f.createAction} onPress={cb}>
                <Text style={f.createActionIcon}>{ic}</Text><Text style={f.createActionTxt}>{lb}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {posts.map((p, i) => (
          <React.Fragment key={p.id}>
            {renderPost(p)}
            {i === 0 && (
              <View style={[f.postCard, {paddingTop: 12}]}>
                <View style={{flexDirection:'row', alignItems:'center', paddingHorizontal:16, marginBottom:12}}>
                  <Text style={{flex:1, fontWeight:'700', color:C.text, fontSize:16}}>Những người bạn có thể biết</Text>
                  <Text style={{color:C.sub, fontSize:16}}>•••</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16, gap:8, paddingBottom:12}}>
                  {users.filter(u=>!u.friend && u.id!=='me').map(u=>(
                    <View key={u.id} style={{width: 220, borderWidth:1, borderColor:C.border, borderRadius:12, overflow:'hidden', backgroundColor:C.card}}>
                      <Image source={{uri:u.cover}} style={{width:'100%', height:100}}/>
                      <Image source={{uri:u.ava}} style={{width:80, height:80, borderRadius:40, borderWidth:3, borderColor:C.card, position:'absolute', top:60, alignSelf:'center'}}/>
                      <View style={{padding:12, paddingTop:45, alignItems:'center'}}>
                        <Text style={{fontWeight:'700', color:C.text, fontSize:16}}>{u.name}</Text>
                        <Text style={{color:C.sub, fontSize:13, marginTop:4}}>{u.mutual} bạn chung</Text>
                        <TouchableOpacity style={{backgroundColor:C.blueLight, paddingVertical:8, paddingHorizontal:24, borderRadius:8, marginTop:12, width:'100%', alignItems:'center'}}>
                          <Text style={{color:C.blue, fontWeight:'700'}}>Thêm bạn bè</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </React.Fragment>
        ))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  function renderPost(p:any) {
    const total=totalR(p.react), tops=topR(p.react);
    const open=expandedPost===p.id;
    const rItem=REACTIONS.find(r=>r.key===p.myReact);

    return (
      <View key={p.id} style={f.postCard}>
        {/* Header */}
        <View style={f.postHead}>
          <TouchableOpacity onPress={()=>openProfile(users.find(u=>u.id===p.uid)||{id:p.uid,name:p.uname,ava:p.uava})}>
            <Image source={{uri:p.uava}} style={f.postAva}/>
          </TouchableOpacity>
          <View style={{flex:1,marginLeft:10}}>
            <TouchableOpacity onPress={()=>openProfile(users.find(u=>u.id===p.uid)||{id:p.uid,name:p.uname,ava:p.uava})}>
              <Text style={f.postName}>{p.uname}{p.feeling?<Text style={f.postFeeling}> — {p.feeling}</Text>:null}</Text>
            </TouchableOpacity>
            <Text style={f.postMeta}>{p.time} · {p.privacy}{p.location?` · ${p.location}`:''}</Text>
          </View>
          <TouchableOpacity style={f.postMoreBtn} onPress={()=>setPostMenu(p.id)}>
            <Text style={f.postMoreDots}>•••</Text>
          </TouchableOpacity>
        </View>

        {p.bgColor ? (
          <View style={{backgroundColor:p.bgColor, padding:40, alignItems:'center', justifyContent:'center', minHeight: 250, marginBottom: 12}}>
            <Text style={{color:p.textColor, fontSize:26, fontWeight:'700', textAlign:'center', lineHeight:34}}>{p.text}</Text>
          </View>
        ) : (
          <>
            <Text style={f.postText}>{p.text}</Text>
            {!!p.img&&<Image source={{uri:p.img}} style={f.postImg} resizeMode="cover"/>}
          </>
        )}

        {/* Poll */}
        {p.poll&&(
          <View style={f.pollWrap}>
            <Text style={f.pollQ}>{p.poll.question}</Text>
            {p.poll.options.map((o:any,i:number)=>{
              const pct=p.poll.total>0?Math.round(o.votes/p.poll.total*100):0;
              const voted=p.poll.voted===i;
              return (
                <TouchableOpacity key={i} style={[f.pollOpt,voted&&f.pollOptVoted,p.poll.voted!==null&&f.pollOptResult]} onPress={()=>votePoll(p.id,i)} disabled={p.poll.voted!==null}>
                  {p.poll.voted!==null&&<View style={[f.pollBar,{width:`${pct}%` as any}]}/>}
                  <Text style={[f.pollOptTxt,voted&&{fontWeight:'700'}]}>{o.text}</Text>
                  {p.poll.voted!==null&&<Text style={f.pollPct}>{pct}%</Text>}
                  {voted&&<Text style={f.pollCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <Text style={f.pollTotal}>{p.poll.total} phiếu bầu · {p.poll.voted!==null?'Đã bầu':'Chạm để bầu'}</Text>
          </View>
        )}

        {/* Reaction summary */}
        {total>0&&(
          <View style={f.reactBar}>
            <View style={{flexDirection:'row'}}>{tops.map((e,i)=><Text key={i} style={f.reactEmoji}>{e}</Text>)}</View>
            <Text style={f.reactCount}>{total.toLocaleString()}</Text>
            <Text style={f.cCount}>{p.comments.length} bình luận · {p.shares} chia sẻ</Text>
          </View>
        )}

        {/* Action row */}
        <View style={f.actRow}>
          <TouchableOpacity style={f.act} onPress={()=>react(p.id,p.myReact||'👍')} onLongPress={()=>setReactTarget(reactTarget===p.id?'':p.id)}>
            <Text style={[f.actTxt,p.myReact&&{color:rItem?.color||C.blue,fontWeight:'700'}]}>{p.myReact||'👍'} {p.myReact?rItem?.label:'Thích'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={f.act} onPress={()=>setExpandedPost(open?'':p.id)}>
            <Text style={f.actTxt}>💬 Bình luận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={f.act} onPress={()=>setShareTarget(p)}>
            <Text style={f.actTxt}>↗️ Chia sẻ</Text>
          </TouchableOpacity>
        </View>

        {/* Reaction picker */}
        {reactTarget===p.id&&(
          <View style={f.reactPicker}>
            {REACTIONS.map(r=>(
              <TouchableOpacity key={r.key} style={[f.rPickBtn,p.myReact===r.key&&f.rPickBtnSel]} onPress={()=>react(p.id,r.key)}>
                <Text style={f.rPickEmoji}>{r.key}</Text>
                <Text style={[f.rPickLabel,{color:r.color}]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Comments */}
        {open&&(
          <View style={f.cmtSection}>
            <View style={f.cmtSortRow}><Text style={f.cmtSort}>Phù hợp nhất ▾</Text></View>
            {p.comments.map((c:any)=>(
              <View key={c.id}>
                <View style={f.cmtRow}>
                  <TouchableOpacity onPress={()=>openProfile(users.find(u=>u.id===c.uid)||{id:c.uid,name:c.name,ava:c.ava})}>
                    <Image source={{uri:c.ava}} style={f.cmtAva}/>
                  </TouchableOpacity>
                  <View style={{flex:1}}>
                    <View style={f.cmtBubble}>
                      <Text style={f.cmtName}>{c.name}</Text>
                      <Text style={f.cmtTxt}>{c.text}</Text>
                    </View>
                    <View style={f.cmtMeta}>
                      <Text style={f.cmtMetaTxt}>{c.time}</Text>
                      <TouchableOpacity onPress={()=>likeComment(p.id,c.id)}><Text style={[f.cmtMetaTxt,{fontWeight:'700'},c.liked&&{color:C.blue}]}>Thích{c.likes>0?` · ${c.likes}`:''}</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>setReplyInfo({pid:p.id,cid:c.id,name:c.name})}><Text style={[f.cmtMetaTxt,{fontWeight:'700'}]}>Phản hồi</Text></TouchableOpacity>
                    </View>
                    {c.replies?.map((r:any)=>(
                      <View key={r.id} style={f.replyRow}>
                        <Image source={{uri:r.ava}} style={f.replyAva}/>
                        <View style={f.cmtBubble}><Text style={f.cmtName}>{r.name}</Text><Text style={f.cmtTxt}>{r.text}</Text></View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
            {replyInfo?.pid===p.id&&(
              <View style={f.replyBanner}>
                <Text style={f.replyBannerTxt}>↩ Đang phản hồi {replyInfo.name}</Text>
                <TouchableOpacity onPress={()=>setReplyInfo(null)}><Text style={f.replyBannerX}>✕</Text></TouchableOpacity>
              </View>
            )}
            <View style={f.cmtInputRow}>
              <Image source={{uri:avatarUrl}} style={f.cmtAva}/>
              <View style={f.cmtInputWrap}>
                <TextInput style={f.cmtInput} placeholder={replyInfo?.pid===p.id?`Phản hồi ${replyInfo.name}...`:'Viết bình luận...'} placeholderTextColor="#9CA3AF" value={commentText} onChangeText={setCommentText} onSubmitEditing={()=>addComment(p.id)} returnKeyType="send"/>
                <TouchableOpacity onPress={()=>addComment(p.id)} style={{padding:6}}><Text style={{color:C.blue,fontWeight:'700',fontSize:16}}>➤</Text></TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingVertical:6,paddingHorizontal:4}}>
              {QUICK_EMOJIS.map(e=><TouchableOpacity key={e} style={{paddingHorizontal:5}} onPress={()=>setCommentText(t=>t+e)}><Text style={{fontSize:22}}>{e}</Text></TouchableOpacity>)}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // FRIENDS
  // ═══════════════════════════════════════════════════════════════════
  function renderFriends() {
    const suggested=users.filter(u=>!u.friend).filter(u=>!searchQ||u.name.toLowerCase().includes(searchQ.toLowerCase()));
    const myFriends=users.filter(u=>u.friend).filter(u=>!searchQ||u.name.toLowerCase().includes(searchQ.toLowerCase()));
    const pendReqs=notifs.filter(n=>n.type==='friend');

    return (
      <ScrollView style={g.scroll}>
        <Text style={s.pageTitle}>Bạn bè</Text>
        <View style={s.searchBar}>
          <Text>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Tìm kiếm bạn bè..." placeholderTextColor="#9CA3AF" value={searchQ} onChangeText={setSearchQ}/>
          {!!searchQ?<TouchableOpacity onPress={()=>setSearchQ('')}><Text style={{color:C.sub}}>✕</Text></TouchableOpacity>:null}
        </View>

        {pendReqs.length>0&&(
          <View style={s.section}>
            <View style={s.sectionHead}><Text style={s.sectionTitle}>Lời mời kết bạn</Text><TouchableOpacity><Text style={s.sectionLink}>Xem tất cả</Text></TouchableOpacity></View>
            {pendReqs.map(n=>{
              const u=users.find(u=>u.name===n.actor);
              return (
                <View key={n.id} style={s.reqCard}>
                  <Image source={{uri:n.ava}} style={s.reqAva}/>
                  <View style={{flex:1,marginLeft:12}}>
                    <Text style={s.reqName}>{n.actor}</Text>
                    {u&&<Text style={s.reqMutual}>{u.mutual} bạn chung</Text>}
                    <View style={{flexDirection:'row',gap:8,marginTop:8}}>
                      <TouchableOpacity style={s.btnPri} onPress={()=>{setUsers(us=>us.map(x=>x.name===n.actor?{...x,friend:true}:x));setNotifs(ns=>ns.filter(x=>x.id!==n.id));}}><Text style={s.btnPriTxt}>Xác nhận</Text></TouchableOpacity>
                      <TouchableOpacity style={s.btnSec} onPress={()=>setNotifs(ns=>ns.filter(x=>x.id!==n.id))}><Text style={s.btnSecTxt}>Xóa</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {suggested.length>0&&(
          <View style={s.section}>
            <View style={s.sectionHead}><Text style={s.sectionTitle}>Gợi ý kết bạn</Text><TouchableOpacity><Text style={s.sectionLink}>Xem tất cả</Text></TouchableOpacity></View>
            {suggested.map(u=>renderUserRow(u))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Bạn bè ({myFriends.length})</Text>
          {myFriends.map(u=>renderUserRow(u))}
        </View>
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  function renderUserRow(u:any) {
    return (
      <TouchableOpacity key={u.id} style={s.userRow} onPress={()=>openProfile(u)}>
        <Image source={{uri:u.ava}} style={s.userAva}/>
        <View style={{flex:1,marginLeft:12}}>
          <Text style={s.userName}>{u.name}</Text>
          <Text style={s.userBio} numberOfLines={1}>{u.bio}</Text>
          {!u.friend&&u.mutual>0&&<Text style={s.mutual}>{u.mutual} bạn chung</Text>}
        </View>
        <View style={{gap:6}}>
          <TouchableOpacity style={[s.actionBtn,u.friend?s.actionBtnSec:s.actionBtnPri]} onPress={(e:any)=>{e?.stopPropagation?.();setUsers(us=>us.map(x=>x.id===u.id?{...x,friend:!x.friend}:x));}}>
            <Text style={[s.actionBtnTxt,u.friend&&s.actionBtnTxtSec]}>{u.friend?'✓ Bạn bè':'+ Kết bạn'}</Text>
          </TouchableOpacity>
          {u.friend&&<TouchableOpacity style={s.actionBtnMsg} onPress={(e:any)=>{e?.stopPropagation?.();setChatTarget(u);setScreen('messages');}}><Text style={s.actionBtnTxtSec}>💬 Nhắn tin</Text></TouchableOpacity>}
        </View>
      </TouchableOpacity>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // WATCH
  // ═══════════════════════════════════════════════════════════════════
  function renderWatch() {
    const VIDEOS=[
      {id:'v1',title:'Khám phá Đà Lạt 2024 - Thành phố ngàn hoa',thumb:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600',views:'1,2 N',dur:'12:34',channel:'VietTravel',ava:'https://i.pravatar.cc/150?img=15',likes:'4.5K'},
      {id:'v2',title:'Nấu phở bò chuẩn Nam Bộ từ A đến Z 🍜',thumb:'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',views:'856K',dur:'18:22',channel:'Bếp Nhà Em',ava:'https://i.pravatar.cc/150?img=25',likes:'12.3K'},
      {id:'v3',title:'Một ngày ở Hội An cổ kính',thumb:'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=600',views:'2,5 N',dur:'8:15',channel:'VietVlog',ava:'https://i.pravatar.cc/150?img=11',likes:'8.9K'},
      {id:'v4',title:'Top 10 cà phê đẹp nhất Sài Gòn 2024',thumb:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',views:'445K',dur:'6:50',channel:'CafeReview SG',ava:'https://i.pravatar.cc/150?img=5',likes:'6.2K'},
    ];
    return (
      <ScrollView style={g.scroll}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,paddingBottom:8}}>
          <Text style={s.pageTitle}>Video</Text>
          <TouchableOpacity style={s.btnPri} onPress={()=>setScreen('reels')}><Text style={s.btnPriTxt}>🎬 Reels</Text></TouchableOpacity>
        </View>
        {VIDEOS.map(v=>(
          <View key={v.id} style={wv.card}>
            <View style={wv.thumbWrap}>
              <Image source={{uri:v.thumb}} style={wv.thumb} resizeMode="cover"/>
              <View style={wv.playBtn}><Text style={wv.playIcon}>▶</Text></View>
              <View style={wv.dur}><Text style={wv.durTxt}>{v.dur}</Text></View>
            </View>
            <View style={wv.info}>
              <Image source={{uri:v.ava}} style={wv.channelAva}/>
              <View style={{flex:1,marginLeft:10}}>
                <Text style={wv.title}>{v.title}</Text>
                <Text style={wv.meta}>{v.channel} · {v.views} lượt xem · 👍 {v.likes}</Text>
              </View>
              <TouchableOpacity style={{padding:6}}><Text style={{color:C.sub}}>•••</Text></TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // REELS
  // ═══════════════════════════════════════════════════════════════════
  function renderReels() {
    const r=reels[Math.min(curIdx, reels.length-1)];
    return (
      <View style={{flex:1,backgroundColor:'#000'}}>
        <Image source={{uri:r.thumb}} style={StyleSheet.absoluteFillObject} resizeMode="cover"/>
        <View style={{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.3)'}}/>

        {/* Top */}
        <View style={{position:'absolute',top:Platform.OS==='android'?36:10,left:0,right:0,flexDirection:'row',alignItems:'center',paddingHorizontal:16}}>
          <TouchableOpacity onPress={()=>setScreen('watch')} style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:20}}>←</Text>
          </TouchableOpacity>
          <Text style={{color:'#fff',fontWeight:'700',fontSize:18,flex:1,textAlign:'center'}}>Reels</Text>
          <TouchableOpacity style={{width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:20}}>📷</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={{position:'absolute',bottom:80,left:0,right:60,padding:16}}>
          <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
            <Image source={{uri:r.uava}} style={{width:36,height:36,borderRadius:18,borderWidth:2,borderColor:'#fff'}}/>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:15}}>{r.uname}</Text>
            <TouchableOpacity style={{borderWidth:1,borderColor:'#fff',borderRadius:6,paddingHorizontal:10,paddingVertical:4}}><Text style={{color:'#fff',fontSize:13,fontWeight:'700'}}>Theo dõi</Text></TouchableOpacity>
          </View>
          <Text style={{color:'#fff',fontSize:14,lineHeight:20}}>{r.caption}</Text>
          <Text style={{color:'rgba(255,255,255,0.8)',fontSize:13,marginTop:6}}>🎵 {r.sound}</Text>
        </View>

        {/* Right actions */}
        <View style={{position:'absolute',bottom:80,right:8,gap:20,alignItems:'center'}}>
          {[['👍',r.likes.toLocaleString()],['💬',r.comments.toString()],['↗️',r.shares.toString()],['🔖','']].map(([ic,ct],i)=>(
            <TouchableOpacity key={i} style={{alignItems:'center'}}>
              <Text style={{fontSize:30}}>{ic}</Text>
              {ct?<Text style={{color:'#fff',fontSize:13,marginTop:2}}>{ct}</Text>:null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation */}
        <View style={{position:'absolute',bottom:16,left:0,right:0,flexDirection:'row',justifyContent:'center',gap:20}}>
          <TouchableOpacity style={{width:48,height:48,borderRadius:24,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'}} onPress={()=>setCurIdx(Math.max(0,curIdx-1))}>
            <Text style={{color:'#fff',fontSize:22}}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{width:48,height:48,borderRadius:24,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'}} onPress={()=>setCurIdx(Math.min(reels.length-1,curIdx+1))}>
            <Text style={{color:'#fff',fontSize:22}}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // LIVE STREAM
  // ═══════════════════════════════════════════════════════════════════
  function renderLive() {
    return (
      <KeyboardAvoidingView style={{flex:1,backgroundColor:'#000'}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <Image source={{uri:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}} style={StyleSheet.absoluteFillObject} resizeMode="cover"/>
        <View style={{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.5)'}}/>

        {/* Header */}
        <View style={{position:'absolute',top:Platform.OS==='android'?36:10,left:0,right:0,padding:16,flexDirection:'row',alignItems:'center',gap:10}}>
          <Image source={{uri:avatarUrl}} style={{width:44,height:44,borderRadius:22,borderWidth:3,borderColor:'#EF4444'}}/>
          <View>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:15}}>{userName}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <View style={{backgroundColor:'#EF4444',borderRadius:4,paddingHorizontal:8,paddingVertical:2}}><Text style={{color:'#fff',fontWeight:'900',fontSize:12}}>⦿ TRỰC TIẾP</Text></View>
              <Text style={{color:'#fff',fontSize:13}}>👁 {liveViewers.toLocaleString()}</Text>
            </View>
          </View>
          <TouchableOpacity style={{marginLeft:'auto',width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center'}} onPress={()=>setScreen('feed')}>
            <Text style={{color:'#fff',fontWeight:'700',fontSize:18}}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Live comments */}
        <View style={{position:'absolute',bottom:70,left:0,right:70,padding:12,maxHeight:200}}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {liveMsgs.map(m=>(
              <View key={m.id} style={{flexDirection:'row',alignItems:'center',marginBottom:8,gap:6}}>
                <View style={{width:28,height:28,borderRadius:14,backgroundColor:m.color,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontWeight:'700',fontSize:12}}>{m.name[0]}</Text></View>
                <View style={{backgroundColor:'rgba(0,0,0,0.5)',borderRadius:16,paddingHorizontal:10,paddingVertical:5}}>
                  <Text style={{color:'#fff',fontSize:13}}><Text style={{fontWeight:'700'}}>{m.name}</Text>: {m.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Right side actions */}
        <View style={{position:'absolute',bottom:80,right:8,gap:16,alignItems:'center'}}>
          {[['❤️','245'],['💬','89'],['↗️','34']].map(([ic,ct],i)=>(
            <TouchableOpacity key={i} style={{alignItems:'center'}}>
              <Text style={{fontSize:28}}>{ic}</Text>
              <Text style={{color:'#fff',fontSize:12}}>{ct}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={{position:'absolute',bottom:0,left:0,right:0,flexDirection:'row',alignItems:'center',padding:10,backgroundColor:'rgba(0,0,0,0.7)',gap:8}}>
          <TextInput style={{flex:1,backgroundColor:'rgba(255,255,255,0.15)',borderRadius:22,paddingHorizontal:16,paddingVertical:9,color:'#fff',fontSize:15}} placeholder="Bình luận..." placeholderTextColor="rgba(255,255,255,0.5)" value={liveMsg} onChangeText={setLiveMsg} onSubmitEditing={sendLiveMsg}/>
          <TouchableOpacity onPress={sendLiveMsg} style={{width:38,height:38,borderRadius:19,backgroundColor:C.blue,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#fff',fontSize:16}}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // GROUPS
  // ═══════════════════════════════════════════════════════════════════
  function renderGroups() {
    const joined=groups.filter(g2=>g2.joined);
    const discover=groups.filter(g2=>!g2.joined);
    return (
      <ScrollView style={g.scroll}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:16,paddingBottom:8}}>
          <Text style={s.pageTitle}>Nhóm</Text>
          <TouchableOpacity style={s.btnPri}><Text style={s.btnPriTxt}>+ Tạo nhóm</Text></TouchableOpacity>
        </View>
        <View style={s.searchBar}>
          <Text>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Tìm kiếm nhóm..." placeholderTextColor="#9CA3AF"/>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Nhóm của bạn ({joined.length})</Text>
          {joined.map(g2=>(
            <TouchableOpacity key={g2.id} style={gr.card} onPress={()=>{setGroupTarget(g2);setScreen('group_detail');}}>
              <Image source={{uri:g2.cover}} style={gr.cover}/>
              <View style={gr.info}>
                <Image source={{uri:g2.ava}} style={gr.ava}/>
                <View style={{flex:1,marginLeft:10}}>
                  <Text style={gr.name}>{g2.name}</Text>
                  <Text style={gr.meta}>{g2.type==='public'?'🌐 Nhóm công khai':' 🔒 Nhóm riêng tư'} · {g2.members} thành viên</Text>
                  {g2.newPosts>0&&<Text style={gr.newPosts}>🔴 {g2.newPosts} bài viết mới</Text>}
                </View>
                <TouchableOpacity style={s.btnSec} onPress={e=>{e?.stopPropagation?.();setGroups(gs=>gs.map(x=>x.id===g2.id?{...x,joined:false}:x));}}><Text style={s.btnSecTxt}>Rời nhóm</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Khám phá nhóm</Text>
          {discover.map(g2=>(
            <TouchableOpacity key={g2.id} style={gr.card} onPress={()=>{setGroupTarget(g2);setScreen('group_detail');}}>
              <Image source={{uri:g2.cover}} style={gr.cover}/>
              <View style={gr.info}>
                <Image source={{uri:g2.ava}} style={gr.ava}/>
                <View style={{flex:1,marginLeft:10}}>
                  <Text style={gr.name}>{g2.name}</Text>
                  <Text style={gr.meta}>{g2.type==='public'?'🌐 Nhóm công khai':'🔒 Nhóm riêng tư'} · {g2.members} thành viên</Text>
                </View>
                <TouchableOpacity style={s.btnPri} onPress={e=>{e?.stopPropagation?.();setGroups(gs=>gs.map(x=>x.id===g2.id?{...x,joined:true}:x));}}><Text style={s.btnPriTxt}>Tham gia</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  function renderGroupDetail() {
    const g2=groupTarget;
    const grPosts=posts.slice(0,3);
    return (
      <ScrollView style={g.scroll}>
        <TouchableOpacity style={s.backRow} onPress={()=>{setGroupTarget(null);setScreen('groups');}}>
          <Text style={s.backTxt}>← Quay lại</Text>
        </TouchableOpacity>
        <Image source={{uri:g2.cover}} style={{width:'100%',height:180}}/>
        <View style={{backgroundColor:'#fff',padding:16}}>
          <Text style={{fontSize:22,fontWeight:'900',color:C.text,marginBottom:4}}>{g2.name}</Text>
          <Text style={{color:C.sub,marginBottom:8}}>{g2.type==='public'?'🌐 Nhóm công khai':'🔒 Nhóm riêng tư'} · {g2.members} thành viên</Text>
          <View style={{flexDirection:'row',gap:8}}>
            {g2.joined
              ?<TouchableOpacity style={s.btnSec} onPress={()=>setGroups(gs=>gs.map(x=>x.id===g2.id?{...x,joined:false}:x))}><Text style={s.btnSecTxt}>✓ Đã tham gia ▾</Text></TouchableOpacity>
              :<TouchableOpacity style={s.btnPri} onPress={()=>setGroups(gs=>gs.map(x=>x.id===g2.id?{...x,joined:true}:x))}><Text style={s.btnPriTxt}>+ Tham gia nhóm</Text></TouchableOpacity>}
            <TouchableOpacity style={s.btnSec}><Text style={s.btnSecTxt}>🔔 Thông báo</Text></TouchableOpacity>
            <TouchableOpacity style={s.btnSec}><Text style={s.btnSecTxt}>🔍 Tìm kiếm</Text></TouchableOpacity>
          </View>
        </View>

        {g2.joined&&(
          <View style={{backgroundColor:'#fff',margin:8,borderRadius:8,padding:12}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10}}>
              <Image source={{uri:avatarUrl}} style={{width:40,height:40,borderRadius:20}}/>
              <TouchableOpacity style={{flex:1,borderRadius:22,borderWidth:1,borderColor:C.border,paddingHorizontal:14,paddingVertical:10}}>
                <Text style={{color:C.sub}}>Viết gì đó lên nhóm...</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {grPosts.map(p=>renderPost(p))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MARKETPLACE
  // ═══════════════════════════════════════════════════════════════════
  function renderMarket() {
    const items=MARKETPLACE_INIT.filter(i=>marketCat==='Tất cả'||i.title.toLowerCase().includes(marketCat.toLowerCase())).filter(i=>!marketSearch||i.title.toLowerCase().includes(marketSearch.toLowerCase()));
    return (
      <ScrollView style={g.scroll}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:16,paddingBottom:8}}>
          <Text style={s.pageTitle}>Marketplace</Text>
          <TouchableOpacity style={s.btnPri}><Text style={s.btnPriTxt}>+ Đăng bán</Text></TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[s.searchBar,{marginBottom:0}]}>
          <Text>🔍</Text>
          <TextInput style={s.searchInput} placeholder="Tìm kiếm sản phẩm..." placeholderTextColor="#9CA3AF" value={marketSearch} onChangeText={setMarketSearch}/>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{padding:12,paddingTop:8}}>
          {MCAT.map(c=>(
            <TouchableOpacity key={c} style={[mk.cat,marketCat===c&&mk.catActive]} onPress={()=>setMarketCat(c)}>
              <Text style={[mk.catTxt,marketCat===c&&mk.catTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid */}
        <View style={mk.grid}>
          {items.map(item=>(
            <TouchableOpacity key={item.id} style={mk.item} onPress={()=>setMarketItem(item)}>
              <Image source={{uri:item.img}} style={mk.itemImg} resizeMode="cover"/>
              <View style={mk.itemInfo}>
                <Text style={mk.itemPrice}>{item.price}</Text>
                <Text style={mk.itemTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={mk.itemMeta}>{item.location}</Text>
                <Text style={mk.itemCond}>{item.condition}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  function renderMarketDetail() {
    const item=marketItem;
    return (
      <ScrollView style={g.scroll}>
        <TouchableOpacity style={s.backRow} onPress={()=>setMarketItem(null)}>
          <Text style={s.backTxt}>← Quay lại</Text>
        </TouchableOpacity>
        <Image source={{uri:item.img}} style={{width:'100%',height:300}} resizeMode="cover"/>
        <View style={{backgroundColor:'#fff',padding:16}}>
          <Text style={{fontSize:26,fontWeight:'900',color:C.blue,marginBottom:4}}>{item.price}</Text>
          <Text style={{fontSize:20,fontWeight:'700',color:C.text,marginBottom:8}}>{item.title}</Text>
          <Text style={{color:C.sub,marginBottom:4}}>📍 {item.location}</Text>
          <Text style={{color:C.sub,marginBottom:4}}>📦 Tình trạng: {item.condition}</Text>
          <Text style={{color:C.sub,marginBottom:16}}>🕐 Đăng: {item.time}</Text>
          <View style={{flexDirection:'row',gap:8}}>
            <TouchableOpacity style={[s.btnPri,{flex:1}]}><Text style={s.btnPriTxt}>💬 Nhắn tin người bán</Text></TouchableOpacity>
            <TouchableOpacity style={s.btnSec}><Text style={s.btnSecTxt}>🔖</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{backgroundColor:'#fff',padding:16,margin:8,borderRadius:8}}>
          <Text style={{fontWeight:'700',color:C.text,fontSize:16,marginBottom:10}}>Người bán</Text>
          <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
            <Image source={{uri:`https://i.pravatar.cc/150?img=11`}} style={{width:48,height:48,borderRadius:24}}/>
            <View style={{flex:1}}>
              <Text style={{fontWeight:'700',color:C.text,fontSize:15}}>{item.seller}</Text>
              <Text style={{color:C.sub,fontSize:13}}>Thành viên từ 2019 · ⭐ 4.8</Text>
            </View>
            <TouchableOpacity style={s.btnSec}><Text style={s.btnSecTxt}>Xem trang cá nhân</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════════════════════════════
  function renderEvents() {
    return (
      <ScrollView style={g.scroll}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:16,paddingBottom:8}}>
          <Text style={s.pageTitle}>Sự kiện</Text>
          <TouchableOpacity style={s.btnPri}><Text style={s.btnPriTxt}>+ Tạo sự kiện</Text></TouchableOpacity>
        </View>

        {events.map(ev=>(
          <View key={ev.id} style={ev2.card}>
            <Image source={{uri:ev.img}} style={ev2.img} resizeMode="cover"/>
            <View style={ev2.info}>
              <Text style={ev2.date}>📅 {ev.date}</Text>
              <Text style={ev2.title}>{ev.title}</Text>
              <Text style={ev2.location}>📍 {ev.location}</Text>
              <Text style={ev2.meta}>👤 {ev.organizer}</Text>
              <Text style={ev2.count}>✅ {ev.going.toLocaleString()} người sẽ đến · ⭐ {ev.interested.toLocaleString()} người quan tâm</Text>
              <View style={{flexDirection:'row',gap:8,marginTop:8}}>
                <TouchableOpacity style={[ev2.btn,ev.status==='going'&&ev2.btnActive]} onPress={()=>setEvents(es=>es.map(e=>e.id===ev.id?{...e,status:e.status==='going'?null:'going',going:e.status==='going'?e.going-1:e.going+1}:e))}>
                  <Text style={[ev2.btnTxt,ev.status==='going'&&{color:'#fff'}]}>✅ {ev.status==='going'?'Đang đến':'Sẽ đến'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[ev2.btn,ev.status==='interested'&&ev2.btnInterested]} onPress={()=>setEvents(es=>es.map(e=>e.id===ev.id?{...e,status:e.status==='interested'?null:'interested'}:e))}>
                  <Text style={[ev2.btnTxt,ev.status==='interested'&&{color:C.blue}]}>⭐ {ev.status==='interested'?'Quan tâm rồi':'Quan tâm'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ev2.btn}><Text style={ev2.btnTxt}>↗️ Chia sẻ</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════
  function renderNotifs() {
    const ICONS:Record<string,string>={like:'👍',comment:'💬',friend:'👥',accept:'✅',tag:'🏷️',bday:'🎂',group:'👥'};
    const filtered=notifFilter==='unread'?notifs.filter(n=>!n.read):notifs;
    return (
      <View style={{flex:1}}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:12,paddingBottom:4,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:C.div}}>
          <Text style={s.pageTitle}>Thông báo</Text>
          <TouchableOpacity><Text style={{color:C.blue,fontWeight:'700'}}>•••</Text></TouchableOpacity>
        </View>
        <View style={{flexDirection:'row',backgroundColor:'#fff',paddingHorizontal:16,paddingBottom:8,gap:8}}>
          {(['all','unread'] as const).map(f=>(
            <TouchableOpacity key={f} style={[nt.filterBtn,notifFilter===f&&nt.filterBtnA]} onPress={()=>setNotifFilter(f)}>
              <Text style={[nt.filterTxt,notifFilter===f&&nt.filterTxtA]}>{f==='all'?'Tất cả':'Chưa đọc'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={g.scroll}>
          {filtered.length===0&&<View style={{padding:40,alignItems:'center'}}><Text style={{fontSize:40,marginBottom:12}}>🔔</Text><Text style={{color:C.sub,fontSize:16}}>Không có thông báo chưa đọc</Text></View>}
          {filtered.map(x=>(
            <TouchableOpacity key={x.id} style={[nt.row,!x.read&&nt.rowUnread]} onPress={()=>setNotifs(ns=>ns.map(n=>n.id===x.id?{...n,read:true}:n))}>
              <View style={{position:'relative',flexShrink:0}}>
                {x.ava?<Image source={{uri:x.ava}} style={nt.ava}/>:<View style={[nt.ava,{backgroundColor:C.bg,alignItems:'center',justifyContent:'center'}]}><Text style={{fontSize:22}}>{ICONS[x.type]}</Text></View>}
                <View style={nt.typeBadge}><Text style={{fontSize:11}}>{ICONS[x.type]||'📢'}</Text></View>
              </View>
              <View style={{flex:1}}>
                <Text style={nt.txt}><Text style={nt.actor}>{x.actor} </Text>{x.text}</Text>
                <Text style={[nt.time,!x.read&&{color:C.blue,fontWeight:'700'}]}>{x.time}</Text>
                {x.type==='friend'&&(
                  <View style={{flexDirection:'row',gap:8,marginTop:8}}>
                    <TouchableOpacity style={s.btnPri} onPress={()=>{setUsers(us=>us.map(u=>u.name===x.actor?{...u,friend:true}:u));setNotifs(ns=>ns.map(n=>n.id===x.id?{...n,type:'accept',text:'đã trở thành bạn bè với bạn',read:true}:n));}}><Text style={s.btnPriTxt}>Xác nhận</Text></TouchableOpacity>
                    <TouchableOpacity style={s.btnSec} onPress={()=>setNotifs(ns=>ns.filter(n=>n.id!==x.id))}><Text style={s.btnSecTxt}>Xóa</Text></TouchableOpacity>
                  </View>
                )}
              </View>
              {x.img?<Image source={{uri:x.img}} style={nt.postThumb}/>:null}
              {!x.read&&<View style={nt.dot}/>}
            </TouchableOpacity>
          ))}
          <View style={{height:80}}/>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MENU
  // ═══════════════════════════════════════════════════════════════════
  function renderMenu() {
    const myFriends=users.filter(u=>u.friend);
    const shortcuts=[
      {icon:'🤖',label:'Meta AI',    action:()=>Alert.alert('Meta AI','Hệ thống AI đang được tích hợp.')},
      {icon:'👥',label:'Bạn bè',     action:()=>setScreen('friends')},
      {icon:'⏰',label:'Kỷ niệm',   action:()=>setScreen('memories')},
      {icon:'🔖',label:'Đã lưu',     action:()=>setScreen('saved')},
      {icon:'🌍',label:'Nhóm',       action:()=>setScreen('groups')},
      {icon:'🎬',label:'Thước phim', action:()=>setScreen('reels')},
      {icon:'🛒',label:'Marketplace',action:()=>setScreen('market')},
      {icon:'⬇️',label:'Xem thêm',   action:()=>{}},
    ];
    const groupShortcuts=[
      {icon:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150',label:'CẦN LÀ CÓ(Haui)'},
      {icon:'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150',label:'Google Gemini Việt Nam'},
      {icon:'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150',label:'Cộng Đồng Google Gemini Việt Nam'},
      {icon:'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=150',label:'Chợ Tài Khoản AI Giá Rẻ - ChatGPT...'},
      {icon:'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=150',label:'Cộng đồng Google AntiGravity Ai...'},
      {icon:'⬇️',label:'Xem thêm'},
    ];
    return (
      <ScrollView style={g.scroll}>
        <TouchableOpacity style={mn.profileRow} onPress={()=>openProfile({id:'me',name:userName,ava:avatarUrl,bio,cover:'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=800'})}>
          <Image source={{uri:avatarUrl}} style={mn.profileAva}/>
          <View><Text style={mn.profileName}>{userName}</Text><Text style={mn.profileSub}>Xem trang cá nhân của bạn</Text></View>
        </TouchableOpacity>
        <View style={mn.div}/>

        <Text style={mn.secTitle}>Lối tắt chính</Text>
        <View style={{paddingHorizontal:16, marginBottom:16}}>
          {shortcuts.map(sc=>(
            <TouchableOpacity key={sc.label} style={{flexDirection:'row', alignItems:'center', paddingVertical:10}} onPress={sc.action}>
              <View style={{width:36, height:36, borderRadius:18, backgroundColor:C.hover, alignItems:'center', justifyContent:'center', marginRight:12}}><Text style={{fontSize:20}}>{sc.icon}</Text></View>
              <Text style={{fontWeight:'600', color:C.text, fontSize:15}}>{sc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={mn.div}/>

        <Text style={mn.secTitle}>Lối tắt của bạn</Text>
        <View style={{paddingHorizontal:16, marginBottom:16}}>
          {groupShortcuts.map(sc=>(
            <TouchableOpacity key={sc.label} style={{flexDirection:'row', alignItems:'center', paddingVertical:10}}>
              {sc.icon === '⬇️' ? (
                <View style={{width:36, height:36, borderRadius:18, backgroundColor:C.hover, alignItems:'center', justifyContent:'center', marginRight:12}}><Text style={{fontSize:20}}>{sc.icon}</Text></View>
              ) : (
                <Image source={{uri:sc.icon}} style={{width:36, height:36, borderRadius:8, marginRight:12}}/>
              )}
              <Text style={{fontWeight:'600', color:C.text, fontSize:15, flex:1}} numberOfLines={2}>{sc.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={mn.div}/>

        <Text style={mn.secTitle}>Bạn bè ({myFriends.length})</Text>
        {myFriends.map(u=>(
          <TouchableOpacity key={u.id} style={mn.friendRow} onPress={()=>openProfile(u)}>
            <View style={{position:'relative'}}>
              <Image source={{uri:u.ava}} style={mn.friendAva}/>
              {u.online&&<View style={mn.onlineDot}/>}
            </View>
            <Text style={mn.friendName}>{u.name}</Text>
          </TouchableOpacity>
        ))}
        <View style={mn.div}/>

        {[
          {icon:'⚙️',label:'Cài đặt & quyền riêng tư', action:()=>Alert.alert('Cài đặt', 'Các tùy chọn này đang được tích hợp vào hệ thống Super App.')},
          {icon:'❓',label:'Trợ giúp & hỗ trợ', action:()=>Alert.alert('Hỗ trợ', 'Vui lòng liên hệ Trung tâm trợ giúp để được giải đáp.')},
          {icon:'🌙',label:'Chế độ tối', action:()=>Alert.alert('Chế độ tối', 'Giao diện tối đang được phát triển và sẽ sớm ra mắt!')},
          {icon:'🚪',label:'Đăng xuất', action:()=>{
            Alert.alert('Đăng xuất','Bạn có chắc chắn muốn thoát khỏi mạng xã hội?',[
              {text:'Hủy',style:'cancel'},
              {text:'Đăng xuất',style:'destructive',onPress:()=>{ router.canGoBack()?router.back():router.replace('/'); }}
            ]);
          }}
        ].map(item=>(
          <TouchableOpacity key={item.label} style={mn.settingRow} onPress={item.action}>
            <View style={mn.settingIcon}><Text style={{fontSize:18}}>{item.icon}</Text></View>
            <Text style={mn.settingLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MESSAGES + CHAT
  // ═══════════════════════════════════════════════════════════════════
  function renderMsgList() {
    return (
      <View style={{flex:1}}>
        <View style={ms.header}>
          <Text style={ms.title}>{userName}</Text>
          <TouchableOpacity style={ms.headerBtn}><Text style={ms.headerBtnTxt}>✏️</Text></TouchableOpacity>
        </View>
        <View style={ms.searchBar}><Text>🔍</Text><TextInput style={ms.searchInput} placeholder="Tìm kiếm..." placeholderTextColor="#9CA3AF"/></View>
        <ScrollView style={g.scroll}>
          {MSGS_INIT.map(m=>{
            const u=users.find(u=>u.id===m.uid)||{id:m.uid,name:m.name,ava:m.ava,online:m.online};
            return (
              <TouchableOpacity key={m.id} style={ms.row} onPress={()=>setChatTarget(u)}>
                <View style={{position:'relative'}}>
                  <Image source={{uri:m.ava}} style={ms.ava}/>
                  {m.online&&<View style={ms.onlineDot}/>}
                </View>
                <View style={{flex:1,marginLeft:12}}>
                  <Text style={[ms.name,m.unread>0&&{fontWeight:'700'}]}>{m.name}</Text>
                  <Text style={[ms.last,m.unread>0&&{fontWeight:'700',color:C.text}]} numberOfLines={1}>{m.last}</Text>
                </View>
                <View style={{alignItems:'flex-end',gap:4}}>
                  <Text style={ms.time}>{m.time}</Text>
                  {m.unread>0&&<View style={ms.badge}><Text style={ms.badgeTxt}>{m.unread}</Text></View>}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{height:80}}/>
        </ScrollView>
      </View>
    );
  }

  function renderChat() {
    const u=chatTarget;
    const msgs2=chats[u.id]||[];
    const isOnline=MSGS_INIT.find(m=>m.uid===u.id)?.online;
    return (
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
        <View style={ch.header}>
          <TouchableOpacity style={ch.backBtn} onPress={()=>setChatTarget(null)}><Text style={ch.backIcon}>←</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>openProfile(u)}><Image source={{uri:u.ava}} style={ch.ava}/></TouchableOpacity>
          <View style={{flex:1,marginLeft:10}}>
            <Text style={ch.name}>{u.name}</Text>
            <Text style={ch.status}>{isOnline?'🟢 Đang hoạt động':'⚪ Không hoạt động'}</Text>
          </View>
          <TouchableOpacity style={ch.actionBtn}><Text style={{fontSize:18}}>📞</Text></TouchableOpacity>
          <TouchableOpacity style={ch.actionBtn}><Text style={{fontSize:18}}>📹</Text></TouchableOpacity>
          <TouchableOpacity style={ch.actionBtn}><Text style={{fontSize:18}}>ℹ️</Text></TouchableOpacity>
        </View>
        <ScrollView style={ch.msgs} contentContainerStyle={{padding:16}}>
          <View style={ch.intro}>
            <Image source={{uri:u.ava}} style={ch.introAva}/>
            <Text style={ch.introName}>{u.name}</Text>
            <Text style={ch.introSub}>Các bạn là bạn bè trên VietBook</Text>
          </View>
          {msgs2.map((x:any)=>(
            <View key={x.id} style={[ch.bubbleRow,x.mine&&ch.bubbleRowMine]}>
              {!x.mine&&<Image source={{uri:u.ava}} style={ch.bubbleAva}/>}
              <View style={[ch.bubble,x.mine?ch.bubbleMine:ch.bubbleTheirs]}>
                <Text style={[ch.bubbleTxt,x.mine&&ch.bubbleTxtMine]}>{x.text}</Text>
              </View>
            </View>
          ))}
          {msgs2.length>0&&msgs2[msgs2.length-1].mine&&<Text style={ch.seen}>✓✓ Đã gửi</Text>}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ch.quickRow}>
          {QUICK_EMOJIS.map(e=><TouchableOpacity key={e} style={{paddingHorizontal:7,paddingVertical:4}} onPress={()=>setChatMsg(t=>t+e)}><Text style={{fontSize:22}}>{e}</Text></TouchableOpacity>)}
        </ScrollView>
        <View style={ch.inputRow}>
          <TouchableOpacity style={ch.plusBtn}><Text style={ch.plusIcon}>+</Text></TouchableOpacity>
          <View style={ch.inputWrap}>
            <TextInput style={ch.input} placeholder="Aa..." placeholderTextColor="#9CA3AF" value={chatMsg} onChangeText={setChatMsg} onSubmitEditing={sendChat} returnKeyType="send"/>
            <TouchableOpacity><Text style={{fontSize:18}}>😊</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={ch.sendBtn} onPress={sendChat}><Text style={ch.sendIcon}>➤</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // PROFILE
  // ═══════════════════════════════════════════════════════════════════
  function renderProfile() {
    const u=profileTarget;
    if(!u)return null;
    const isMe=u.id==='me';
    const udata=users.find(x=>x.id===u.id)||u;
    const uPosts=isMe?posts.filter(p=>p.uid==='me'):posts.filter(p=>p.uid===u.id);
    return (
      <ScrollView style={g.scroll}>
        <TouchableOpacity style={s.backRow} onPress={()=>setScreen('feed')}><Text style={s.backTxt}>← Quay lại</Text></TouchableOpacity>
        <View>
          <Image source={{uri:udata.cover||'https://images.unsplash.com/photo-1518655048521-f130df041f66?w=800'}} style={pr.cover}/>
          <Image source={{uri:isMe?avatarUrl:u.ava}} style={pr.ava}/>
        </View>
        <View style={pr.infoBlock}>
          <Text style={pr.name}>{isMe?userName:u.name}</Text>
          <Text style={pr.bio}>{isMe?bio:(udata.bio||u.bio||'')}</Text>
          {udata.mutual>0&&!isMe&&<Text style={pr.mutual}>{udata.mutual} bạn chung</Text>}
          <View style={pr.actions}>
            {isMe?(
              <TouchableOpacity style={[pr.editBtn,{flex:1}]} onPress={()=>router.push('/account')}><Text style={pr.editBtnTxt}>✏️ Chỉnh sửa trang cá nhân</Text></TouchableOpacity>
            ):(
              <>
                <TouchableOpacity style={[pr.mainBtn,udata.friend&&pr.mainBtnSec,{flex:1}]} onPress={()=>setUsers(us=>us.map(x=>x.id===u.id?{...x,friend:!x.friend}:x))}>
                  <Text style={[pr.mainBtnTxt,udata.friend&&{color:C.text}]}>{udata.friend?'✓ Bạn bè':'+ Thêm bạn bè'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[pr.msgBtn,{flex:1}]} onPress={()=>{setChatTarget(udata);setScreen('messages');}}>
                  <Text style={pr.msgBtnTxt}>💬 Nhắn tin</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <View style={pr.tabs}>
          {(['posts','about','photos','friends'] as const).map(t=>(
            <TouchableOpacity key={t} style={[pr.tab,profTab===t&&pr.tabActive]} onPress={()=>setProfTab(t)}>
              <Text style={[pr.tabTxt,profTab===t&&pr.tabTxtActive]}>{t==='posts'?'Bài viết':t==='about'?'Giới thiệu':t==='photos'?'Ảnh':'Bạn bè'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {profTab==='posts'&&(uPosts.length===0?<View style={{padding:40,alignItems:'center'}}><Text style={{fontSize:40,marginBottom:8}}>📝</Text><Text style={{color:C.sub,fontSize:16}}>Chưa có bài viết</Text></View>:uPosts.map(p=>renderPost(p)))}
        {profTab==='about'&&(
          <View style={pr.aboutBlock}>
            {[{icon:'💼',label:udata.work||'Chưa cập nhật'},{icon:'🎓',label:udata.school||'Chưa cập nhật'},{icon:'🏠',label:udata.city||'Chưa cập nhật'}].map((item,i)=>(
              <View key={i} style={pr.aboutRow}><Text style={pr.aboutIcon}>{item.icon}</Text><Text style={pr.aboutTxt}>{item.label}</Text></View>
            ))}
          </View>
        )}
        {profTab==='photos'&&<View style={pr.photoGrid}>{PHOTOS_GRID.map((ph,i)=><Image key={i} source={{uri:ph}} style={pr.photoThumb}/>)}</View>}
        {profTab==='friends'&&<View style={{padding:8}}>{users.filter(u2=>u2.friend).map(u2=>renderUserRow(u2))}</View>}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════════════════
  function renderSearch() {
    const uRes=searchQ?users.filter(u=>u.name.toLowerCase().includes(searchQ.toLowerCase())):[];
    const pRes=searchQ?posts.filter(p=>p.text.toLowerCase().includes(searchQ.toLowerCase())||p.uname.toLowerCase().includes(searchQ.toLowerCase())):[];
    const RECENT=['Cà phê Sài Gòn','Lê Minh Châu','#travel','Phở bò','Dev Vietnam'];
    return (
      <View style={{flex:1}}>
        <View style={se.header}>
          <TouchableOpacity style={se.back} onPress={()=>setScreen('feed')}><Text style={se.backTxt}>←</Text></TouchableOpacity>
          <View style={se.inputWrap}>
            <Text>🔍</Text>
            <TextInput style={se.input} placeholder="Tìm kiếm..." placeholderTextColor="#9CA3AF" value={searchQ} onChangeText={setSearchQ} autoFocus/>
            {!!searchQ&&<TouchableOpacity onPress={()=>setSearchQ('')}><Text style={{color:C.sub}}>✕</Text></TouchableOpacity>}
          </View>
        </View>
        <ScrollView style={g.scroll} keyboardShouldPersistTaps="handled">
          {!searchQ&&RECENT.map((q,i)=>(
            <TouchableOpacity key={i} style={se.recentRow} onPress={()=>setSearchQ(q)}>
              <View style={se.recentIcon}><Text>🕐</Text></View>
              <Text style={se.recentTxt}>{q}</Text>
              <TouchableOpacity><Text style={{color:C.sub}}>✕</Text></TouchableOpacity>
            </TouchableOpacity>
          ))}
          {uRes.length>0&&<><Text style={[s.sectionTitle,{paddingHorizontal:16}]}>Mọi người</Text>{uRes.map(u=>renderUserRow(u))}</>}
          {pRes.length>0&&<><Text style={[s.sectionTitle,{paddingHorizontal:16}]}>Bài viết</Text>{pRes.map(p=>renderPost(p))}</>}
          {!!searchQ&&uRes.length===0&&pRes.length===0&&<View style={{padding:40,alignItems:'center'}}><Text style={{fontSize:40,marginBottom:12}}>🔍</Text><Text style={{color:C.sub,fontSize:16,textAlign:'center'}}>Không tìm thấy kết quả cho "{searchQ}"</Text></View>}
          <View style={{height:80}}/>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // SAVED
  // ═══════════════════════════════════════════════════════════════════
  function renderSaved() {
    return (
      <ScrollView style={g.scroll}>
        <TouchableOpacity style={s.backRow} onPress={()=>setScreen('menu')}><Text style={s.backTxt}>← Quay lại</Text></TouchableOpacity>
        <Text style={[s.pageTitle,{paddingHorizontal:16}]}>Bài viết đã lưu</Text>
        {savedPosts.length===0&&(
          <View style={{padding:40,alignItems:'center'}}>
            <Text style={{fontSize:48,marginBottom:12}}>🔖</Text>
            <Text style={{fontWeight:'700',color:C.text,fontSize:18,marginBottom:8}}>Chưa có bài viết nào được lưu</Text>
            <Text style={{color:C.sub,textAlign:'center',fontSize:14}}>Khi bạn lưu bài viết, chúng sẽ xuất hiện tại đây</Text>
          </View>
        )}
        {savedPosts.map(p=>renderPost(p))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MEMORIES
  // ═══════════════════════════════════════════════════════════════════
  function renderMemories() {
    return (
      <ScrollView style={g.scroll}>
        <View style={{flexDirection:'row',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:C.border}}>
          <TouchableOpacity onPress={()=>setScreen('menu')} style={{marginRight:16}}>
            <Text style={{fontSize:24}}>←</Text>
          </TouchableOpacity>
          <Text style={{fontSize:20,fontWeight:'700',color:C.text}}>Kỷ niệm</Text>
        </View>
        <Image source={{uri:'https://images.unsplash.com/photo-1506744626753-efa7df6fcc8c?w=800'}} style={{width:'100%',height:150}}/>
        <View style={{padding:16,alignItems:'center',marginTop:-40}}>
          <View style={{backgroundColor:'#fff',borderRadius:40,padding:12,elevation:4,shadowColor:'#000',shadowOpacity:0.1,shadowRadius:4}}>
            <Text style={{fontSize:30}}>🌍</Text>
          </View>
          <Text style={{fontSize:20,fontWeight:'700',marginTop:12,color:C.text}}>Vào ngày này</Text>
          <Text style={{color:C.sub,textAlign:'center',marginTop:4}}>Chúng tôi hy vọng bạn thích xem lại và chia sẻ những kỷ niệm của mình trên VietBook.</Text>
        </View>
        <View style={{padding:16,backgroundColor:C.border,marginBottom:10}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.text}}>2 năm trước</Text>
        </View>
        {posts.slice(0,1).map(p=>renderPost({...p, time:'Ngày này 2 năm trước'}))}
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // GAMING
  // ═══════════════════════════════════════════════════════════════════
  function renderGaming() {
    const games = [
      {id:1,name:'Ludo King',img:'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=300',players:'1.2M'},
      {id:2,name:'8 Ball Pool',img:'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=300',players:'3M'},
      {id:3,name:'Candy Crush',img:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',players:'5M'},
    ];
    return (
      <ScrollView style={g.scroll} backgroundColor="#f0f2f5">
        <View style={{flexDirection:'row',alignItems:'center',padding:16,backgroundColor:'#fff'}}>
          <TouchableOpacity onPress={()=>setScreen('menu')} style={{marginRight:16}}><Text style={{fontSize:24}}>←</Text></TouchableOpacity>
          <Text style={{fontSize:20,fontWeight:'700',color:C.text}}>Trò chơi</Text>
          <View style={{flex:1}}/>
          <TouchableOpacity style={{width:36,height:36,borderRadius:18,backgroundColor:C.bgHov,alignItems:'center',justifyContent:'center'}}><Text>🔍</Text></TouchableOpacity>
        </View>
        
        <View style={{padding:16,backgroundColor:'#fff',marginTop:8}}>
          <Text style={{fontSize:18,fontWeight:'700',marginBottom:12}}>Tiếp tục chơi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {games.map(g=>(
              <TouchableOpacity key={g.id} style={{width:100,marginRight:12}}>
                <Image source={{uri:g.img}} style={{width:100,height:100,borderRadius:12,marginBottom:8}}/>
                <Text style={{fontWeight:'600',fontSize:14}} numberOfLines={1}>{g.name}</Text>
                <Text style={{color:C.sub,fontSize:12}}>{g.players} người chơi</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{padding:16,backgroundColor:'#fff',marginTop:8}}>
          <Text style={{fontSize:18,fontWeight:'700',marginBottom:12}}>Phát trực tiếp phổ biến</Text>
          <View style={{borderRadius:8,overflow:'hidden',borderWidth:1,borderColor:C.border}}>
            <Image source={{uri:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}} style={{width:'100%',height:200}}/>
            <View style={{position:'absolute',top:8,left:8,backgroundColor:'red',paddingHorizontal:8,paddingVertical:2,borderRadius:4}}><Text style={{color:'#fff',fontWeight:'700',fontSize:12}}>TRỰC TIẾP</Text></View>
            <View style={{position:'absolute',top:8,left:80,backgroundColor:'rgba(0,0,0,0.6)',paddingHorizontal:8,paddingVertical:2,borderRadius:4}}><Text style={{color:'#fff',fontWeight:'700',fontSize:12}}>👁 1.2K</Text></View>
            <View style={{padding:12}}>
              <Text style={{fontWeight:'700',fontSize:16}}>Giải đấu vô địch eSports 2026</Text>
              <Text style={{color:C.sub,marginTop:4}}>Gaming Arena đang phát trực tiếp.</Text>
            </View>
          </View>
        </View>
        <View style={{height:80}}/>
      </ScrollView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ACTIVITY LOG
  // ═══════════════════════════════════════════════════════════════════
  function renderActivity() {
    return (
      <ScrollView style={g.scroll} backgroundColor="#f0f2f5">
        <View style={{flexDirection:'row',alignItems:'center',padding:16,backgroundColor:'#fff'}}>
          <TouchableOpacity onPress={()=>setScreen('menu')} style={{marginRight:16}}><Text style={{fontSize:24}}>←</Text></TouchableOpacity>
          <Text style={{fontSize:20,fontWeight:'700',color:C.text}}>Nhật ký hoạt động</Text>
        </View>
        <View style={{padding:16,backgroundColor:'#fff',marginTop:8}}>
          <Text style={{fontSize:16,fontWeight:'700',color:C.text,marginBottom:16}}>Gần đây</Text>
          
          <View style={{flexDirection:'row',marginBottom:20}}>
            <View style={{width:40,height:40,borderRadius:20,backgroundColor:'#E7F3FF',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:20}}>👍</Text></View>
            <View style={{flex:1,marginLeft:12,justifyContent:'center'}}>
              <Text style={{fontSize:15}}><Text style={{fontWeight:'700'}}>Bạn</Text> đã bày tỏ cảm xúc về một bài viết của <Text style={{fontWeight:'700'}}>Võ Hoài Nam</Text>.</Text>
              <Text style={{color:C.sub,fontSize:13,marginTop:4}}>15 phút trước</Text>
            </View>
            <TouchableOpacity><Text style={{fontSize:20,color:C.sub}}>•••</Text></TouchableOpacity>
          </View>

          <View style={{flexDirection:'row',marginBottom:20}}>
            <View style={{width:40,height:40,borderRadius:20,backgroundColor:'#E7F3FF',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:20}}>💬</Text></View>
            <View style={{flex:1,marginLeft:12,justifyContent:'center'}}>
              <Text style={{fontSize:15}}><Text style={{fontWeight:'700'}}>Bạn</Text> đã bình luận về một bài viết của <Text style={{fontWeight:'700'}}>Mai Phương</Text>.</Text>
              <Text style={{color:C.sub,fontSize:13,marginTop:4}}>2 giờ trước</Text>
            </View>
            <TouchableOpacity><Text style={{fontSize:20,color:C.sub}}>•••</Text></TouchableOpacity>
          </View>
          
          <View style={{flexDirection:'row',marginBottom:20}}>
            <View style={{width:40,height:40,borderRadius:20,backgroundColor:'#E7F3FF',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:20}}>👥</Text></View>
            <View style={{flex:1,marginLeft:12,justifyContent:'center'}}>
              <Text style={{fontSize:15}}><Text style={{fontWeight:'700'}}>Bạn</Text> đã trở thành bạn bè với <Text style={{fontWeight:'700'}}>Đỗ Quang</Text>.</Text>
              <Text style={{color:C.sub,fontSize:13,marginTop:4}}>Hôm qua</Text>
            </View>
            <TouchableOpacity><Text style={{fontSize:20,color:C.sub}}>•••</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{height:80}}/>
      </ScrollView>
    );
  }


  function renderStoryModal() {
    const st=storyTarget;
    const w2=storyAnim.interpolate({inputRange:[0,1],outputRange:['0%','100%']});
    return (
      <Modal visible animationType="fade" onRequestClose={()=>{storyAnim.stopAnimation();setStoryTarget(null);}}>
        <View style={{flex:1,backgroundColor:'#000'}}>
          <Image source={{uri:st.img}} style={StyleSheet.absoluteFillObject} resizeMode="cover"/>
          <View style={{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.2)'}}/>
          <View style={{position:'absolute',top:Platform.OS==='android'?36:10,left:12,right:12}}>
            <View style={{height:3,backgroundColor:'rgba(255,255,255,0.35)',borderRadius:2}}>
              <Animated.View style={{height:3,backgroundColor:'#fff',borderRadius:2,width:w2}}/>
            </View>
          </View>
          <View style={{position:'absolute',top:Platform.OS==='android'?50:24,left:12,flexDirection:'row',alignItems:'center',gap:10}}>
            <Image source={{uri:st.ava}} style={{width:38,height:38,borderRadius:19,borderWidth:2,borderColor:C.blue}}/>
            <View><Text style={{color:'#fff',fontWeight:'700',fontSize:14}}>{st.name}</Text></View>
          </View>
          {st.caption?<View style={{position:'absolute',bottom:100,left:0,right:0,alignItems:'center'}}><Text style={{color:'#fff',fontSize:18,fontWeight:'700',textShadowColor:'rgba(0,0,0,0.6)',textShadowOffset:{width:0,height:1},textShadowRadius:4}}>{st.caption}</Text></View>:null}
          {/* Reply to story */}
          <View style={{position:'absolute',bottom:20,left:12,right:48,flexDirection:'row',alignItems:'center',gap:8}}>
            <View style={{flex:1,flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.5)',borderRadius:22,paddingHorizontal:14,paddingVertical:8}}>
              <TextInput style={{flex:1,color:'#fff',fontSize:14}} placeholder="Trả lời tin..." placeholderTextColor="rgba(255,255,255,0.6)"/>
            </View>
            <TouchableOpacity style={{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:20}}>❤️</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={{position:'absolute',top:Platform.OS==='android'?48:22,right:12,width:36,height:36,borderRadius:18,backgroundColor:'rgba(0,0,0,0.5)',alignItems:'center',justifyContent:'center'}} onPress={()=>{storyAnim.stopAnimation();setStoryTarget(null);}}>
            <Text style={{color:'#fff',fontSize:18,fontWeight:'700'}}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  function renderCreateModal() {
    return (
      <Modal visible animationType="slide" onRequestClose={()=>setShowCreate(false)}>
        <KeyboardAvoidingView style={{flex:1,backgroundColor:'#fff'}} behavior={Platform.OS==='ios'?'padding':undefined}>
          <View style={cr.header}>
            <TouchableOpacity onPress={()=>setShowCreate(false)}><Text style={cr.cancel}>Hủy</Text></TouchableOpacity>
            <Text style={cr.title}>Tạo bài viết</Text>
            <TouchableOpacity onPress={createPost} style={[cr.postBtn,!(newText.trim()||(newPollMode&&pollQ.trim()))&&cr.postBtnOff]}>
              <Text style={cr.postBtnTxt}>Đăng</Text>
            </TouchableOpacity>
          </View>
          <View style={cr.author}>
            <Image source={{uri:avatarUrl}} style={cr.ava}/>
            <View>
              <Text style={cr.name}>{userName}</Text>
              <View style={cr.audience}><Text style={cr.audienceTxt}>🌐 Mọi người ▾</Text></View>
            </View>
          </View>
          {newFeeling?<View style={cr.feelingBadge}><Text style={cr.feelingBadgeTxt}>{newFeeling}</Text><TouchableOpacity onPress={()=>setNewFeeling('')}><Text style={{color:C.sub,marginLeft:6}}>✕</Text></TouchableOpacity></View>:null}

          {!newPollMode?(
            <TextInput style={cr.input} placeholder={`${userName.split(' ').pop()} ơi, bạn đang nghĩ gì?`} placeholderTextColor="#9CA3AF" multiline value={newText} onChangeText={setNewText} autoFocus textAlignVertical="top"/>
          ):(
            <View style={{padding:16}}>
              <TextInput style={[cr.input,{minHeight:60}]} placeholder="Câu hỏi khảo sát..." placeholderTextColor="#9CA3AF" value={pollQ} onChangeText={setPollQ} autoFocus/>
              {pollOpts.map((opt,i)=>(
                <View key={i} style={{flexDirection:'row',alignItems:'center',marginBottom:8,gap:8}}>
                  <TextInput style={{flex:1,borderWidth:1,borderColor:C.border,borderRadius:8,padding:10,color:C.text,fontSize:15}} placeholder={`Lựa chọn ${i+1}`} placeholderTextColor="#9CA3AF" value={opt} onChangeText={v=>setPollOpts(opts=>opts.map((o,j)=>j===i?v:o))}/>
                  {i>=2&&<TouchableOpacity onPress={()=>setPollOpts(opts=>opts.filter((_,j)=>j!==i))}><Text style={{color:C.red,fontSize:20}}>✕</Text></TouchableOpacity>}
                </View>
              ))}
              {pollOpts.length<6&&<TouchableOpacity style={[s.btnSec,{alignSelf:'flex-start'}]} onPress={()=>setPollOpts(opts=>[...opts,''])}><Text style={s.btnSecTxt}>+ Thêm lựa chọn</Text></TouchableOpacity>}
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{borderTopWidth:1,borderTopColor:C.div,paddingVertical:6,paddingHorizontal:8}}>
            {QUICK_EMOJIS.map(e=><TouchableOpacity key={e} style={{paddingHorizontal:5}} onPress={()=>setNewText(t=>t+e)}><Text style={{fontSize:24}}>{e}</Text></TouchableOpacity>)}
          </ScrollView>

          <View style={cr.actions}>
            {[{icon:'📷',label:'Ảnh/Video'},{icon:'👥',label:'Tag bạn bè'},{icon:'😊',label:'Cảm xúc',cb:()=>setShowFeeling(true)},{icon:'📍',label:'Check-in'},{icon:'📊',label:'Khảo sát',cb:()=>setNewPollMode(v=>!v)}].map(a=>(
              <TouchableOpacity key={a.label} style={[cr.action,a.label==='Khảo sát'&&newPollMode&&{backgroundColor:'#E7F3FF'}]} onPress={a.cb||undefined}>
                <Text style={cr.actionIcon}>{a.icon}</Text>
                <Text style={[cr.actionTxt,a.label==='Khảo sát'&&newPollMode&&{color:C.blue}]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </KeyboardAvoidingView>
        {showFeeling&&(
          <Modal visible animationType="slide" onRequestClose={()=>setShowFeeling(false)}>
            <View style={{flex:1,backgroundColor:'#fff'}}>
              <View style={{flexDirection:'row',alignItems:'center',padding:14,borderBottomWidth:1,borderBottomColor:C.div,gap:12}}>
                <TouchableOpacity onPress={()=>setShowFeeling(false)}><Text style={{fontSize:22,color:C.blue}}>←</Text></TouchableOpacity>
                <Text style={{fontWeight:'700',fontSize:17,color:C.text}}>Bạn đang cảm thấy thế nào?</Text>
              </View>
              <ScrollView>
                {FEELINGS.map(feel=>(
                  <TouchableOpacity key={feel} style={{paddingHorizontal:20,paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#F7F8FA'}} onPress={()=>{setNewFeeling(feel);setShowFeeling(false);}}>
                    <Text style={{fontSize:16,color:C.text}}>{feel}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>
        )}
      </Modal>
    );
  }

  function renderPostMenuModal() {
    const p=posts.find(x=>x.id===postMenu);
    if(!p)return null;
    const isMe=p.uid==='me';
    return (
      <Modal visible transparent animationType="slide" onRequestClose={()=>setPostMenu('')}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}} activeOpacity={1} onPress={()=>setPostMenu('')}>
          <View style={{backgroundColor:'#fff',borderTopLeftRadius:16,borderTopRightRadius:16,paddingBottom:30}}>
            <View style={{width:40,height:4,backgroundColor:C.div,borderRadius:2,alignSelf:'center',marginTop:10,marginBottom:6}}/>
            <TouchableOpacity style={pm.item} onPress={()=>{toggleSave(postMenu);setPostMenu('');}}>
              <Text style={pm.itemTxt}>{p.saved?'🔖  Bỏ lưu bài viết':'🔖  Lưu bài viết'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={pm.item} onPress={()=>{setShareTarget(p);setPostMenu('');}}>
              <Text style={pm.itemTxt}>↗️  Chia sẻ bài viết</Text>
            </TouchableOpacity>
            <TouchableOpacity style={pm.item}><Text style={pm.itemTxt}>🔗  Sao chép liên kết</Text></TouchableOpacity>
            {isMe&&<><TouchableOpacity style={pm.item}><Text style={pm.itemTxt}>✏️  Chỉnh sửa bài viết</Text></TouchableOpacity>
            <TouchableOpacity style={pm.item} onPress={()=>{setPosts(ps=>ps.filter(x=>x.id!==postMenu));setPostMenu('');}}>
              <Text style={[pm.itemTxt,{color:C.red}]}>🗑️  Xóa bài viết</Text>
            </TouchableOpacity></>}
            {!isMe&&<><TouchableOpacity style={pm.item}><Text style={pm.itemTxt}>🔕  Ẩn bài viết này</Text></TouchableOpacity>
            <TouchableOpacity style={pm.item}><Text style={pm.itemTxt}>🚫  Chặn người này</Text></TouchableOpacity>
            <TouchableOpacity style={pm.item}><Text style={[pm.itemTxt,{color:C.red}]}>🚩  Báo cáo bài viết</Text></TouchableOpacity></>}
            <TouchableOpacity style={[pm.item,{borderTopWidth:8,borderTopColor:C.bg,marginTop:8}]} onPress={()=>setPostMenu('')}>
              <Text style={[pm.itemTxt,{textAlign:'center',fontWeight:'700'}]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }

  function renderShareModal() {
    const p=shareTarget;
    if(!p)return null;
    const myFriends=users.filter(u=>u.friend).slice(0,5);
    return (
      <Modal visible transparent animationType="slide" onRequestClose={()=>setShareTarget(null)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}} activeOpacity={1} onPress={()=>setShareTarget(null)}>
          <View style={{backgroundColor:'#fff',borderTopLeftRadius:16,borderTopRightRadius:16,paddingBottom:30}}>
            <View style={{width:40,height:4,backgroundColor:C.div,borderRadius:2,alignSelf:'center',marginTop:10,marginBottom:8}}/>
            <Text style={{fontWeight:'700',fontSize:17,color:C.text,paddingHorizontal:16,marginBottom:12}}>Chia sẻ bài viết</Text>

            {/* Share options */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:12,gap:12,marginBottom:12}}>
              {[{icon:'📰',label:'Bảng tin'},{icon:'📖',label:'Trang cá nhân'},{icon:'💬',label:'Messenger'},{icon:'👥',label:'Nhóm'},{icon:'🔗',label:'Sao chép link'},{icon:'📤',label:'Ứng dụng khác'}].map(opt=>(
                <TouchableOpacity key={opt.label} style={{alignItems:'center',width:70}} onPress={()=>setShareTarget(null)}>
                  <View style={{width:56,height:56,borderRadius:28,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',marginBottom:6}}>
                    <Text style={{fontSize:26}}>{opt.icon}</Text>
                  </View>
                  <Text style={{color:C.text,fontSize:12,textAlign:'center'}}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Send to friend */}
            <Text style={{paddingHorizontal:16,fontWeight:'700',color:C.text,marginBottom:8}}>Gửi cho bạn bè</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:12,gap:12,marginBottom:12}}>
              {myFriends.map(u=>(
                <TouchableOpacity key={u.id} style={{alignItems:'center',width:64}} onPress={()=>{setChatTarget(u);setShareTarget(null);setScreen('messages');}}>
                  <Image source={{uri:u.ava}} style={{width:54,height:54,borderRadius:27,marginBottom:6}}/>
                  <Text style={{color:C.text,fontSize:12,textAlign:'center'}} numberOfLines={1}>{u.name.split(' ').pop()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[s.btnPri,{marginHorizontal:16}]} onPress={()=>setShareTarget(null)}><Text style={s.btnPriTxt}>Chia sẻ ngay</Text></TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════
const g=StyleSheet.create({
  root:{flex:1,backgroundColor:'#F0F2F5'},
  desk:{maxWidth:480,alignSelf:'center',width:'100%'},
  scroll:{flex:1},
  navbar:{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:8,paddingVertical:6,paddingTop:Platform.OS==='android'?34:6,borderBottomWidth:1,borderBottomColor:'#E4E6EB',elevation:2,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.08,shadowRadius:3},
  navL:{flexDirection:'row',alignItems:'center',flex:1,gap:6},
  navLogo:{width:40,height:40,borderRadius:20,backgroundColor:'#1877F2',alignItems:'center',justifyContent:'center'},
  navLogoTxt:{color:'#fff',fontSize:26,fontWeight:'900',fontStyle:'italic',lineHeight:36},
  navSearchBox:{flexDirection:'row',alignItems:'center',backgroundColor:'#F0F2F5',borderRadius:20,paddingHorizontal:12,paddingVertical:7,gap:6,flex:1},
  navSearchTxt:{color:'#65676B',fontSize:14},
  navC:{flexDirection:'row'},
  navTab:{width:48,height:40,alignItems:'center',justifyContent:'center',position:'relative'},
  navTabA:{},
  navTabIcon:{fontSize:22,opacity:0.45},
  navLine:{position:'absolute',bottom:-7,left:0,right:0,height:3,backgroundColor:'#1877F2',borderRadius:2},
  navR:{flexDirection:'row',gap:6,alignItems:'center'},
  navBtn:{width:38,height:38,borderRadius:19,backgroundColor:'#E4E6EB',alignItems:'center',justifyContent:'center',position:'relative'},
  navBtnIcon:{fontSize:17},
  navBadge:{position:'absolute',top:-2,right:-3,backgroundColor:'#FA3E3E',borderRadius:8,minWidth:16,height:16,alignItems:'center',justifyContent:'center',paddingHorizontal:2,borderWidth:1.5,borderColor:'#fff'},
  navBadgeTxt:{color:'#fff',fontSize:9,fontWeight:'900'},
  navClose:{width:38,height:38,borderRadius:19,backgroundColor:'#E4E6EB',alignItems:'center',justifyContent:'center'},
  navCloseTxt:{color:'#050505',fontWeight:'700',fontSize:14},
});

const f=StyleSheet.create({
  storiesCard:{backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#E4E6EB',marginBottom:8},
  storiesRow:{paddingHorizontal:8,paddingVertical:10,gap:6},
  storyWrap:{width:78,alignItems:'center',marginHorizontal:3},
  storyImgBox:{width:74,height:112,borderRadius:14,overflow:'hidden',backgroundColor:'#E4E6EB'},
  storyImg:{width:'100%',height:'100%'},
  storyDark:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(0,0,0,0.22)'},
  storyRing:{position:'absolute',top:6,left:6,width:30,height:30,borderRadius:15,borderWidth:3,overflow:'hidden'},
  storyRingNew:{borderColor:'#1877F2'},
  storyRingSeen:{borderColor:'#BEC3C9'},
  storyAva:{width:'100%',height:'100%'},
  storyCaption:{position:'absolute',bottom:4,left:4,right:4,color:'#fff',fontSize:10,fontWeight:'700',textShadowColor:'rgba(0,0,0,0.7)',textShadowOffset:{width:0,height:1},textShadowRadius:3},
  storyAddBar:{position:'absolute',bottom:0,left:0,right:0,height:42,backgroundColor:'rgba(255,255,255,0.97)',alignItems:'center',justifyContent:'center'},
  storyAddCircle:{width:24,height:24,borderRadius:12,backgroundColor:'#1877F2',alignItems:'center',justifyContent:'center'},
  storyAddPlus:{color:'#fff',fontSize:18,fontWeight:'900',lineHeight:24},
  storyName:{fontSize:11,color:'#1C1E21',marginTop:4,textAlign:'center',fontWeight:'500'},
  createCard:{backgroundColor:'#fff',borderBottomWidth:8,borderBottomColor:'#F0F2F5',marginBottom:8},
  createRow:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingTop:12,paddingBottom:10,gap:10},
  createAva:{width:42,height:42,borderRadius:21},
  createBox:{flex:1,borderRadius:22,borderWidth:1,borderColor:'#CED0D4',paddingHorizontal:14,paddingVertical:10},
  createHint:{color:'#65676B',fontSize:15},
  createDiv:{height:1,backgroundColor:'#E4E6EB',marginHorizontal:12},
  createActions:{flexDirection:'row',paddingHorizontal:4,paddingVertical:2},
  createAction:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',paddingVertical:8,gap:4},
  createActionIcon:{fontSize:17},
  createActionTxt:{fontSize:12,color:'#65676B',fontWeight:'600'},
  postCard:{backgroundColor:'#fff',marginBottom:8},
  postHead:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingTop:12,paddingBottom:8},
  postAva:{width:44,height:44,borderRadius:22},
  postName:{fontWeight:'700',color:'#050505',fontSize:15},
  postFeeling:{color:'#65676B',fontWeight:'400',fontSize:13},
  postMeta:{color:'#65676B',fontSize:12,marginTop:1},
  postMoreBtn:{padding:8,marginLeft:'auto'},
  postMoreDots:{color:'#65676B',fontSize:20,letterSpacing:1},
  postText:{paddingHorizontal:14,paddingBottom:10,color:'#050505',fontSize:15,lineHeight:22},
  postImg:{width:'100%',minHeight:200,maxHeight:420},
  pollWrap:{marginHorizontal:14,marginBottom:10,borderWidth:1,borderColor:'#E4E6EB',borderRadius:12,overflow:'hidden'},
  pollQ:{fontWeight:'700',color:'#050505',fontSize:15,padding:12,paddingBottom:8},
  pollOpt:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingVertical:11,borderTopWidth:1,borderTopColor:'#F0F2F5',position:'relative',overflow:'hidden'},
  pollOptVoted:{backgroundColor:'#E7F3FF'},
  pollOptResult:{},
  pollBar:{position:'absolute',left:0,top:0,bottom:0,backgroundColor:'#E7F3FF',zIndex:0},
  pollOptTxt:{flex:1,color:'#050505',fontSize:14,zIndex:1},
  pollPct:{color:'#1877F2',fontWeight:'700',fontSize:13,zIndex:1},
  pollCheck:{color:'#1877F2',fontWeight:'900',fontSize:14,marginLeft:6,zIndex:1},
  pollTotal:{color:'#65676B',fontSize:12,padding:10,paddingTop:8},
  reactBar:{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:8,borderTopWidth:1,borderTopColor:'#F7F8FA'},
  reactEmoji:{fontSize:14},
  reactCount:{color:'#65676B',fontSize:13,flex:1,marginLeft:4},
  cCount:{color:'#65676B',fontSize:13},
  actRow:{flexDirection:'row',borderTopWidth:1,borderTopColor:'#E4E6EB'},
  act:{flex:1,alignItems:'center',paddingVertical:9},
  actTxt:{color:'#65676B',fontSize:13,fontWeight:'700'},
  reactPicker:{flexDirection:'row',backgroundColor:'#fff',borderRadius:30,paddingVertical:10,paddingHorizontal:8,marginHorizontal:10,marginBottom:8,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.2,shadowRadius:12,elevation:8,gap:4},
  rPickBtn:{alignItems:'center',flex:1,paddingVertical:3},
  rPickBtnSel:{transform:[{scale:1.25}]},
  rPickEmoji:{fontSize:28},
  rPickLabel:{fontSize:9,fontWeight:'700',marginTop:2},
  cmtSection:{backgroundColor:'#F7F8FA'},
  cmtSortRow:{paddingHorizontal:14,paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#EAEAEA'},
  cmtSort:{color:'#1877F2',fontWeight:'700',fontSize:13},
  cmtRow:{flexDirection:'row',alignItems:'flex-start',paddingHorizontal:12,paddingTop:10,gap:8},
  cmtAva:{width:34,height:34,borderRadius:17,flexShrink:0},
  cmtBubble:{backgroundColor:'#F0F2F5',borderRadius:16,paddingHorizontal:12,paddingVertical:8,flex:1},
  cmtName:{fontWeight:'700',color:'#050505',fontSize:13},
  cmtTxt:{color:'#050505',fontSize:14,marginTop:2},
  cmtMeta:{flexDirection:'row',gap:12,paddingLeft:4,marginTop:4},
  cmtMetaTxt:{color:'#65676B',fontSize:12},
  replyRow:{flexDirection:'row',alignItems:'flex-start',marginTop:8,marginLeft:42,gap:8},
  replyAva:{width:28,height:28,borderRadius:14},
  replyBanner:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'#E7F3FF',borderRadius:8,padding:8,marginHorizontal:12,marginTop:4},
  replyBannerTxt:{color:'#1877F2',fontSize:13},
  replyBannerX:{color:'#65676B',fontSize:16},
  cmtInputRow:{flexDirection:'row',alignItems:'center',padding:10,gap:8},
  cmtInputWrap:{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:'#F0F2F5',borderRadius:22,paddingHorizontal:12},
  cmtInput:{flex:1,paddingVertical:9,color:'#050505',fontSize:14},
});

const s=StyleSheet.create({
  pageTitle:{fontSize:22,fontWeight:'900',color:'#050505',paddingHorizontal:16,paddingTop:12,paddingBottom:4},
  searchBar:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',marginHorizontal:12,marginVertical:8,borderRadius:22,paddingHorizontal:14,paddingVertical:10,gap:8,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.06,shadowRadius:4,elevation:2},
  searchInput:{flex:1,color:'#050505',fontSize:15},
  section:{marginBottom:4},
  sectionHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:6},
  sectionTitle:{fontSize:17,fontWeight:'700',color:'#050505',paddingHorizontal:16,paddingVertical:8},
  sectionLink:{color:'#1877F2',fontWeight:'700',fontSize:14},
  reqCard:{backgroundColor:'#fff',flexDirection:'row',alignItems:'flex-start',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#F7F8FA'},
  reqAva:{width:56,height:56,borderRadius:28},
  reqName:{fontWeight:'700',color:'#050505',fontSize:15},
  reqMutual:{color:'#65676B',fontSize:13,marginTop:2},
  userRow:{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#F7F8FA',gap:0},
  userAva:{width:56,height:56,borderRadius:28},
  userName:{fontWeight:'700',color:'#050505',fontSize:15},
  userBio:{color:'#65676B',fontSize:13,maxWidth:150},
  mutual:{color:'#65676B',fontSize:12,marginTop:2},
  actionBtn:{borderRadius:8,paddingHorizontal:12,paddingVertical:8,alignItems:'center'},
  actionBtnPri:{backgroundColor:'#1877F2'},
  actionBtnSec:{backgroundColor:'#E4E6EB'},
  actionBtnMsg:{backgroundColor:'#E7F3FF',borderRadius:8,paddingHorizontal:12,paddingVertical:8},
  actionBtnTxt:{color:'#fff',fontWeight:'700',fontSize:13},
  actionBtnTxtSec:{color:'#050505',fontWeight:'700',fontSize:13},
  btnPri:{backgroundColor:'#1877F2',borderRadius:8,paddingHorizontal:14,paddingVertical:9,alignItems:'center'},
  btnPriTxt:{color:'#fff',fontWeight:'700',fontSize:14},
  btnSec:{backgroundColor:'#E4E6EB',borderRadius:8,paddingHorizontal:14,paddingVertical:9,alignItems:'center'},
  btnSecTxt:{color:'#050505',fontWeight:'700',fontSize:14},
  backRow:{backgroundColor:'#fff',paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#E4E6EB'},
  backTxt:{color:'#1877F2',fontSize:16,fontWeight:'600'},
});

const wv=StyleSheet.create({
  card:{backgroundColor:'#fff',marginBottom:8},
  thumbWrap:{position:'relative'},
  thumb:{width:'100%',height:220},
  playBtn:{...StyleSheet.absoluteFillObject,alignItems:'center',justifyContent:'center'},
  playIcon:{fontSize:48,color:'rgba(255,255,255,0.9)'},
  dur:{position:'absolute',bottom:8,right:8,backgroundColor:'rgba(0,0,0,0.7)',borderRadius:4,paddingHorizontal:6,paddingVertical:2},
  durTxt:{color:'#fff',fontSize:12,fontWeight:'700'},
  info:{flexDirection:'row',alignItems:'flex-start',padding:12,gap:0},
  channelAva:{width:40,height:40,borderRadius:20},
  title:{fontWeight:'700',color:'#050505',fontSize:15,marginBottom:4},
  meta:{color:'#65676B',fontSize:13},
});

const gr=StyleSheet.create({
  card:{backgroundColor:'#fff',marginBottom:8,overflow:'hidden'},
  cover:{width:'100%',height:100},
  info:{flexDirection:'row',alignItems:'center',padding:12,gap:0},
  ava:{width:48,height:48,borderRadius:8},
  name:{fontWeight:'700',color:'#050505',fontSize:15},
  meta:{color:'#65676B',fontSize:13,marginTop:2},
  newPosts:{color:'#EF4444',fontSize:12,marginTop:2,fontWeight:'700'},
});

const mk=StyleSheet.create({
  cat:{borderRadius:20,paddingHorizontal:14,paddingVertical:8,backgroundColor:'#F0F2F5',marginRight:8},
  catActive:{backgroundColor:'#E7F3FF'},
  catTxt:{color:'#050505',fontWeight:'600',fontSize:14},
  catTxtActive:{color:'#1877F2'},
  grid:{flexDirection:'row',flexWrap:'wrap',padding:4},
  item:{width:'50%',padding:4},
  itemImg:{width:'100%',aspectRatio:1,borderRadius:8,backgroundColor:'#E4E6EB'},
  itemInfo:{padding:6},
  itemPrice:{fontWeight:'900',color:'#050505',fontSize:16},
  itemTitle:{color:'#050505',fontSize:14,marginTop:2},
  itemMeta:{color:'#65676B',fontSize:12,marginTop:2},
  itemCond:{color:'#65676B',fontSize:12},
});

const ev2=StyleSheet.create({
  card:{backgroundColor:'#fff',marginBottom:8},
  img:{width:'100%',height:180},
  info:{padding:14},
  date:{color:'#1877F2',fontWeight:'700',fontSize:13,marginBottom:4},
  title:{fontWeight:'900',color:'#050505',fontSize:17,marginBottom:4},
  location:{color:'#65676B',fontSize:14,marginBottom:2},
  meta:{color:'#65676B',fontSize:13,marginBottom:4},
  count:{color:'#65676B',fontSize:13},
  btn:{borderRadius:8,paddingHorizontal:12,paddingVertical:8,backgroundColor:'#F0F2F5',alignItems:'center'},
  btnActive:{backgroundColor:'#1877F2'},
  btnInterested:{backgroundColor:'#E7F3FF'},
  btnTxt:{color:'#050505',fontWeight:'700',fontSize:13},
});

const nt=StyleSheet.create({
  filterBtn:{borderRadius:16,paddingHorizontal:14,paddingVertical:7,backgroundColor:'#F0F2F5'},
  filterBtnA:{backgroundColor:'#E7F3FF'},
  filterTxt:{color:'#050505',fontWeight:'600',fontSize:14},
  filterTxtA:{color:'#1877F2'},
  row:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',paddingHorizontal:14,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#F7F8FA',gap:10},
  rowUnread:{backgroundColor:'#E7F3FF'},
  ava:{width:56,height:56,borderRadius:28},
  typeBadge:{position:'absolute',bottom:-2,right:-4,width:24,height:24,borderRadius:12,backgroundColor:'#fff',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#E4E6EB'},
  txt:{color:'#050505',fontSize:14,lineHeight:20},
  actor:{fontWeight:'700'},
  time:{color:'#65676B',fontSize:12,marginTop:3},
  postThumb:{width:56,height:56,borderRadius:6},
  dot:{width:12,height:12,borderRadius:6,backgroundColor:'#1877F2',flexShrink:0},
});

const mn=StyleSheet.create({
  profileRow:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12,backgroundColor:'#fff',gap:12,borderBottomWidth:1,borderBottomColor:'#F7F8FA'},
  profileAva:{width:56,height:56,borderRadius:28},
  profileName:{fontWeight:'700',color:'#050505',fontSize:16},
  profileSub:{color:'#65676B',fontSize:13,marginTop:2},
  div:{height:8,backgroundColor:'#F0F2F5'},
  secTitle:{fontSize:17,fontWeight:'700',color:'#050505',paddingHorizontal:16,paddingVertical:10},
  grid:{flexDirection:'row',flexWrap:'wrap',paddingHorizontal:8,paddingBottom:12},
  gridItem:{width:'25%',alignItems:'center',padding:8},
  gridIcon:{width:54,height:54,borderRadius:27,backgroundColor:'#E4E6EB',alignItems:'center',justifyContent:'center',marginBottom:6},
  gridLabel:{fontSize:12,color:'#050505',fontWeight:'600',textAlign:'center'},
  friendRow:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:10,backgroundColor:'#fff',borderBottomWidth:1,borderBottomColor:'#F7F8FA',gap:12},
  friendAva:{width:44,height:44,borderRadius:22},
  friendName:{fontWeight:'700',color:'#050505',fontSize:15},
  onlineDot:{position:'absolute',bottom:1,right:1,width:13,height:13,borderRadius:7,backgroundColor:'#31A24C',borderWidth:2,borderColor:'#fff'},
  settingRow:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',paddingHorizontal:16,paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#F7F8FA',gap:12},
  settingIcon:{width:40,height:40,borderRadius:20,backgroundColor:'#E4E6EB',alignItems:'center',justifyContent:'center'},
  settingLabel:{color:'#050505',fontSize:15,fontWeight:'500'},
});

const ms=StyleSheet.create({
  header:{backgroundColor:'#fff',paddingHorizontal:16,paddingVertical:12,paddingTop:Platform.OS==='android'?36:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#E4E6EB'},
  title:{fontSize:22,fontWeight:'900',color:'#050505'},
  headerBtn:{width:36,height:36,borderRadius:18,backgroundColor:'#F0F2F5',alignItems:'center',justifyContent:'center'},
  headerBtnTxt:{fontSize:18},
  searchBar:{flexDirection:'row',alignItems:'center',backgroundColor:'#F0F2F5',marginHorizontal:12,marginVertical:8,borderRadius:22,paddingHorizontal:14,paddingVertical:10,gap:8},
  searchInput:{flex:1,color:'#050505',fontSize:15},
  row:{flexDirection:'row',alignItems:'center',backgroundColor:'#fff',paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F7F8FA',gap:0},
  ava:{width:54,height:54,borderRadius:27},
  onlineDot:{position:'absolute',bottom:2,right:2,width:14,height:14,borderRadius:7,backgroundColor:'#31A24C',borderWidth:2,borderColor:'#fff'},
  name:{fontSize:15,color:'#050505',marginBottom:2},
  last:{color:'#65676B',fontSize:13},
  time:{color:'#65676B',fontSize:12},
  badge:{backgroundColor:'#1877F2',borderRadius:10,minWidth:20,height:20,alignItems:'center',justifyContent:'center',paddingHorizontal:4},
  badgeTxt:{color:'#fff',fontSize:11,fontWeight:'700'},
});

const ch=StyleSheet.create({
  header:{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',paddingHorizontal:8,paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#E4E6EB',gap:6},
  backBtn:{padding:6},
  backIcon:{fontSize:24,color:'#1877F2'},
  ava:{width:42,height:42,borderRadius:21},
  name:{fontWeight:'700',color:'#050505',fontSize:15},
  status:{color:'#65676B',fontSize:12},
  actionBtn:{width:38,height:38,borderRadius:19,backgroundColor:'#F0F2F5',alignItems:'center',justifyContent:'center'},
  msgs:{flex:1,backgroundColor:'#F0F2F5'},
  intro:{alignItems:'center',paddingVertical:24},
  introAva:{width:80,height:80,borderRadius:40,marginBottom:10},
  introName:{fontWeight:'700',color:'#050505',fontSize:17,marginBottom:4},
  introSub:{color:'#65676B',fontSize:13,textAlign:'center'},
  bubbleRow:{flexDirection:'row',alignItems:'flex-end',marginBottom:6,gap:6},
  bubbleRowMine:{flexDirection:'row-reverse'},
  bubbleAva:{width:28,height:28,borderRadius:14},
  bubble:{maxWidth:'72%',borderRadius:20,paddingHorizontal:14,paddingVertical:10},
  bubbleMine:{backgroundColor:'#1877F2'},
  bubbleTheirs:{backgroundColor:'#fff'},
  bubbleTxt:{fontSize:15,color:'#050505'},
  bubbleTxtMine:{color:'#fff'},
  seen:{color:'#65676B',fontSize:11,textAlign:'right',marginBottom:4},
  quickRow:{backgroundColor:'#fff',borderTopWidth:1,borderTopColor:'#E4E6EB',paddingVertical:6,paddingHorizontal:8},
  inputRow:{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',paddingHorizontal:8,paddingVertical:8,borderTopWidth:1,borderTopColor:'#E4E6EB',gap:6},
  plusBtn:{width:38,height:38,borderRadius:19,backgroundColor:'#F0F2F5',alignItems:'center',justifyContent:'center'},
  plusIcon:{fontSize:22,color:'#1877F2',fontWeight:'700'},
  inputWrap:{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:'#F0F2F5',borderRadius:22,paddingHorizontal:14},
  input:{flex:1,paddingVertical:9,color:'#050505',fontSize:15},
  sendBtn:{width:38,height:38,borderRadius:19,backgroundColor:'#1877F2',alignItems:'center',justifyContent:'center'},
  sendIcon:{color:'#fff',fontSize:15},
});

const pr=StyleSheet.create({
  cover:{width:'100%',height:200,backgroundColor:'#E4E6EB'},
  ava:{width:90,height:90,borderRadius:45,borderWidth:4,borderColor:'#fff',position:'absolute',bottom:-45,left:16},
  infoBlock:{backgroundColor:'#fff',paddingTop:52,paddingHorizontal:16,paddingBottom:14},
  name:{fontSize:22,fontWeight:'900',color:'#050505',marginBottom:4},
  bio:{color:'#65676B',fontSize:15,marginBottom:6},
  mutual:{color:'#65676B',fontSize:14,marginBottom:10},
  actions:{flexDirection:'row',gap:8},
  editBtn:{backgroundColor:'#E4E6EB',borderRadius:8,paddingVertical:10,alignItems:'center'},
  editBtnTxt:{color:'#050505',fontWeight:'700',fontSize:14},
  mainBtn:{backgroundColor:'#1877F2',borderRadius:8,paddingVertical:10,alignItems:'center'},
  mainBtnSec:{backgroundColor:'#E4E6EB'},
  mainBtnTxt:{color:'#fff',fontWeight:'700',fontSize:14},
  msgBtn:{backgroundColor:'#E7F3FF',borderRadius:8,paddingVertical:10,alignItems:'center'},
  msgBtnTxt:{color:'#1877F2',fontWeight:'700',fontSize:14},
  tabs:{backgroundColor:'#fff',flexDirection:'row',borderTopWidth:1,borderTopColor:'#E4E6EB',borderBottomWidth:1,borderBottomColor:'#E4E6EB',marginTop:8},
  tab:{flex:1,alignItems:'center',paddingVertical:11},
  tabActive:{borderBottomWidth:3,borderBottomColor:'#1877F2'},
  tabTxt:{color:'#65676B',fontSize:13,fontWeight:'600'},
  tabTxtActive:{color:'#1877F2'},
  aboutBlock:{backgroundColor:'#fff',padding:16,marginTop:8},
  aboutRow:{flexDirection:'row',alignItems:'center',paddingVertical:10,gap:14,borderBottomWidth:1,borderBottomColor:'#F7F8FA'},
  aboutIcon:{fontSize:20,width:28,textAlign:'center'},
  aboutTxt:{color:'#050505',fontSize:15,flex:1},
  photoGrid:{flexDirection:'row',flexWrap:'wrap',backgroundColor:'#fff',marginTop:8,padding:1},
  photoThumb:{width:'33.33%',aspectRatio:1,padding:1,backgroundColor:'#E4E6EB'},
});

const se=StyleSheet.create({
  header:{backgroundColor:'#fff',flexDirection:'row',alignItems:'center',padding:10,borderBottomWidth:1,borderBottomColor:'#E4E6EB',gap:8},
  back:{padding:6},
  backTxt:{fontSize:22,color:'#1877F2'},
  inputWrap:{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:'#F0F2F5',borderRadius:22,paddingHorizontal:14,paddingVertical:8,gap:8},
  input:{flex:1,color:'#050505',fontSize:15},
  recentRow:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#F7F8FA',gap:12},
  recentIcon:{width:42,height:42,borderRadius:21,backgroundColor:'#F0F2F5',alignItems:'center',justifyContent:'center'},
  recentTxt:{flex:1,color:'#050505',fontSize:15},
});

const cr=StyleSheet.create({
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:14,paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#E4E6EB'},
  cancel:{color:'#1877F2',fontSize:16},
  title:{fontWeight:'700',fontSize:17,color:'#050505'},
  postBtn:{backgroundColor:'#1877F2',borderRadius:8,paddingHorizontal:14,paddingVertical:7},
  postBtnOff:{backgroundColor:'#BEC3C9'},
  postBtnTxt:{color:'#fff',fontWeight:'700',fontSize:15},
  author:{flexDirection:'row',alignItems:'center',padding:14,gap:12},
  ava:{width:46,height:46,borderRadius:23},
  name:{fontWeight:'700',color:'#050505',fontSize:16},
  audience:{backgroundColor:'#F0F2F5',borderRadius:6,paddingHorizontal:8,paddingVertical:3,marginTop:3,alignSelf:'flex-start'},
  audienceTxt:{color:'#050505',fontSize:12,fontWeight:'600'},
  feelingBadge:{flexDirection:'row',alignItems:'center',marginHorizontal:16,marginBottom:8,backgroundColor:'#E7F3FF',borderRadius:8,paddingHorizontal:12,paddingVertical:7,alignSelf:'flex-start'},
  feelingBadgeTxt:{color:'#1877F2',fontWeight:'600',fontSize:14},
  input:{flex:1,fontSize:18,color:'#050505',paddingHorizontal:16,paddingVertical:8,minHeight:120},
  actions:{borderTopWidth:1,borderTopColor:'#E4E6EB',flexDirection:'row',flexWrap:'wrap',padding:6},
  action:{flexDirection:'row',alignItems:'center',margin:4,backgroundColor:'#F0F2F5',borderRadius:20,paddingHorizontal:12,paddingVertical:8,gap:6},
  actionIcon:{fontSize:18},
  actionTxt:{color:'#050505',fontSize:13,fontWeight:'600'},
});

const pm=StyleSheet.create({
  item:{paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#F7F8FA'},
  itemTxt:{fontSize:16,color:'#050505'},
});
