---
---

// home.js

// GitHub
(function updateGitHubBadges() {
    if (!document.hidden) {
        let repository = $('meta[name=repository]').attr('content');
        $('#github-star img').attr('src', `https://img.shields.io/github/stars/${repository}?style=social`);
        $('#github-fork img').attr('src', `https://img.shields.io/github/forks/${repository}?style=social`);
    };
    setTimeout(function () {
        updateGitHubBadges();
    }, {{ site.update_interval }});
})();

// build time
dayjs.locale('zh-cn');
dayjs.extend(window.dayjs_plugin_relativeTime);
(function updateBuildTimeBadge() {
    if (!document.hidden) {
		/* // Get the build time from the meta tag 
		const buildTime = $('meta[name=updated_at]').attr('content'); 
		// Format the build time relative to now 
		const formattedTime = dayjs(buildTime).fromNow(); 
		// Encode the formatted time 
		const encodedTime = encodeURIComponent(formattedTime); 
		console.log(buildTime);
		// Log the formatted time 
		console.log(formattedTime); */
        $('#build-time img').attr('src', `https://img.shields.io/badge/%E6%9E%84%E5%BB%BA%E4%BA%8E-${encodeURIComponent(dayjs($('meta[name=updated_at]').attr('content')).fromNow())}-brightgreen?logo=jekyll`);
    };
    setTimeout(function () {
        updateBuildTimeBadge();
    }, {{ site.update_interval }});
})();

{%- if site.data.analytics.matomo.site_id -%}
// visit
(function updateVisitorBadges() {
    if (!document.hidden) {
        $.getJSON('{{ site.data.analytics.matomo.url }}', {
            'module': 'API',
            'method': 'VisitsSummary.getUniqueVisitors',
            'idSite': '{{ site.data.analytics.matomo.site_id }}',
            'period': 'day',
            'date': 'today',
            'format': 'JSON',
            'token_auth': '{{ site.data.analytics.matomo.token }}'
        }, function (data) {
            $('#today-visitors img').attr('src', `https://img.shields.io/badge/%E4%BB%8A%E6%97%A5%E8%AE%BF%E5%AE%A2-${encodeURIComponent(data.value)}-brightgreen?logo=matomo`);
        });
        $.getJSON('{{ site.data.analytics.matomo.url }}', {
            'module': 'API',
            'method': 'Live.getCounters',
            'idSite': '{{ site.data.analytics.matomo.site_id }}',
            'lastMinutes': '30',
            'format': 'JSON',
            'token_auth': '{{ site.data.analytics.matomo.token }}'
        }, function (data) {
            $('#live-visitors img').attr('src', `https://img.shields.io/badge/%E5%BD%93%E5%89%8D%E5%9C%A8%E7%BA%BF-${encodeURIComponent(data[0].visitors)}-brightgreen?logo=matomo`);
        });
    };
    setTimeout(function () {
        updateVisitorBadges();
    }, {{ site.update_interval }});
})();
{%- endif -%}

// search
$('#search-services').dropdown();

function updateDropdown() {
    $('#search-services').dropdown('set selected', Cookies.get('byr_navi_previous_used_search_service'));
};

function setCookie(name, value) {
    Cookies.set(name, value, {
        expires: 365,
        domain: '.navi.flpro.cn',
        secure: true
    });
};

function redirect(service, query) {
    if (service.data('transcode')) {
        query = query.replace(new RegExp(service.data('transcode-from'), 'g'), service.data('transcode-to'));
    };
    window.open(`search/?service=${encodeURIComponent(service.text())}&query=${query}&next=${encodeURIComponent(service.data('url').replace('{query}', query))}`, '_blank');
};

// initialize previous used search service
if (Cookies.get('byr_navi_previous_used_search_service') === undefined || Cookies.get('byr_navi_previous_used_search_service') === '' || $(`#${Cookies.get('byr_navi_previous_used_search_service')}`).length === 0) {
    setCookie('byr_navi_previous_used_search_service', $('#search-services').val());
} else {
    updateDropdown();
};

// search button
$('#search-button').click(function () {
    let service = $(`#${$('#search-services').val()}`);
    let query = $('#search-query').val();
    query = encodeURIComponent(query);
    if (query) {
        setCookie('byr_navi_previous_used_search_service', service.val());
        redirect(service, query);
    } else {
        $('#search-div').addClass('error');
        $('#search-query').attr('placeholder', '请输入搜索内容');
    };
});

// query input: click to select
$('#search-query').click(function () {
    $(this).select();
});

// query input: auto focus
$(document).ready(function () {
    $('#search-query').focus();
});

// query input: press return/enter to submit
$(window).keyup(function (event) {
    let windowTop = $(window).scrollTop();
    let windowHeight = $(window).innerHeight();
    let windowBottom = windowTop + windowHeight;
    let searchBoxTop = $('#search-div').offset().top;
    let searchBoxHeight = $('#search-div').innerHeight();
    let searchBoxBottom = searchBoxTop + searchBoxHeight;
    if (event.key === 'Enter' && searchBoxBottom > windowTop && searchBoxTop < windowBottom) {
        let service = $(`#${$('#search-services').val()}`);
        let query = $('#search-query').val();
        query = encodeURIComponent(query);
        if (query) {
            if ($('#search-query:focus').length > 0) {
                setCookie('byr_navi_previous_used_search_service', service.val());
                redirect(service, query);
            } else {
                $('#search-query').focus().select();
            };
        } else {
            $('#search-div').addClass('error');
            $('#search-query').attr('placeholder', '请输入搜索内容').focus();
        };
    };
});

// query input: input anything to restore
$('#search-query').keyup(function (event) {
    if (event.key) {
        if ($('#search-query').val()) {
            $('#search-div').removeClass('error');
            $('#search-query').attr('placeholder', '立即搜索');
        };
    };
});

// initialize customized shortcuts
if (Cookies.get('byr_navi_search_shortcuts')) {
    let shortcuts = JSON.parse(Cookies.get('byr_navi_search_shortcuts'));
    $('#search-shortcuts .ui.label').each(function () {
        if (shortcuts[$(this).data('search-service-id')]) {
            if ($(this).hasClass('hidden')) {
                $(this).removeClass('hidden');
            };
        } else {
            if (!$(this).hasClass('hidden')) {
                $(this).addClass('hidden');
            };
        };
    });
};

// shortcuts
$('#search-shortcuts .ui.label').each(function () {
    $(this).click(function () {
        let service = $(`#${$(this).data('search-service-id')}`);
        let query = $('#search-query').val();
        query = encodeURIComponent(query);
        if (query) {
            setCookie('byr_navi_previous_used_search_service', service.val());
            updateDropdown();
            redirect(service, query);
        } else {
            $('#search-div').addClass('error');
            $('#search-query').attr('placeholder', '请输入搜索内容');
        };
    });
});

// query suggestions
var sugParams = {
    "XOffset": -3, //提示框位置横向偏移量,单位px
    "YOffset": -2, //提示框位置纵向偏移量,单位px
    // "width": $('#search-query').innerWidth(), //提示框宽度，单位px
    "fontColor": "rgba(0, 0, 0, 0.87)", //提示框文字颜色
    "fontColorHI": "rgba(0, 0, 0, 0.87)", //提示框高亮选择时文字颜色
    "fontSize": "14px", //文字大小
    "fontFamily": "Lato, 'Helvetica Neue', Arial, Helvetica, sans-serif", //文字字体
    "borderColor": "rgba(34, 36, 38, 0.14902)", //提示框的边框颜色
    "bgcolorHI": "rgba(0, 0, 0, 0.05)", //提示框高亮选择的颜色
    "sugSubmit": false //选中提示框中词条时是否提交表单
};
BaiduSuggestion.bind('search-query', sugParams);



// add by feilong 20250215
// date range
var establishedAt = new Date($('meta[name=established_at]').attr('content'));
function siteEstablishedDays() {
    let d = new Date();
    let today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor((today - establishedAt) / 86400000 + 1);
};


function updateOutlinks() {
    // 获取外链统计
    $.getJSON('{{ site.data.analytics.matomo.url }}', {
        'module': 'API',
        'method': 'Actions.getOutlinks',
        'idSite': '{{ site.data.analytics.matomo.site_id }}',
        'period': 'range',
        'date': `last${siteEstablishedDays()}`,
        'format': 'JSON',
        'filter_limit': '-1',
        'token_auth': '{{ site.data.analytics.matomo.token }}'
    }, function(data) {
        // 构建域名映射字典
        const domainStats = {};
        data.forEach(item => {
            domainStats[item.label] = {
                hits: item.nb_hits || 0,    // 总点击量
                visits: item.nb_visits || 0 // 唯一访问量
            };
        });
        // 遍历所有外链并插入统计信息
        $('.ui.labels a').each(function() {
            const $link = $(this);
            try {
                // 提取标准化域名
                const url = new URL($link.attr('href'));
                let domain = url.hostname
                
                // 获取匹配的访问次数
                const stats = domainStats[domain] || { hits: 0, visits: 0 };
                
                // 插入统计标签（在链接后添加）
				// 移除旧的统计并添加新数据
				$link.find('.detail').remove();
                // 仅在有有效数据时插入标签
                if (stats.hits !== 0 || stats.visits !== 0) {
                    $link.append(
                        `<div class="detail">${stats.hits} (${stats.visits})</div>`
                    );
                }
            } catch (e) {
                console.warn('无效链接地址:', $link.attr('href'));
            }
        });
    });
}


$(document).ready(function() {
  // 点击标签时触发统计更新
  $('.trigger-outlink-stats').on('click', function(e) {
    e.preventDefault(); // 阻止默认跳转
    updateOutlinks();    // 执行更新函数
  });
});