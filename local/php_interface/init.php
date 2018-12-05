<?php
if(!Defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();
// Подключаем файлы приложения
CJSCore::RegisterExt('forTask',
    array(
         'js' => '/local/app.js',
        'lang' => '/local/lang/' . LANGUAGE_ID . '/taskLang.php',
        'css' => '/local/css/style.css',
        'rel' => array(
            'ajax',
            'popup'
        )
    )
);
CJSCore::Init('forTask');
use Bitrix\Main\Page\Asset;
use Bitrix\Main\Config\Option;
// Определяем пути на которых нужно внедрить кнопки в интерфейсе
$arUrlTemplates = array(
    "taskCheck" => "company/personal/user/#USER_ID#/tasks/task/view/#TASK_ID#/");
$arUrlTemplates2 = array(
    "taskCheck" => "workgroups/group/#USER_ID#/tasks/task/view/#TASK_ID#/"
);
use Bitrix\Main\UI\Extension;

Extension::load('ui.buttons');
Extension::load('ui.buttons.icons');
ob_start();
?>
    <div class="pagetitle-container">
        <a href="#" onClick="forTask.createTableForce()" class="ui-btn ui-btn-light-border ui-btn-icon-info">График</a>
    </div>
<?
$customHtml = ob_get_clean();

$APPLICATION->AddViewContent('inside_pagetitle', $customHtml, 20000);
// то после вызова метода
$arVariables = array();
// Отслеживаем появление пользователя на данных страницах
$page = CComponentEngine::ParseComponentPath('/',
        $arUrlTemplates, $arVariables);
$page2 = CComponentEngine::ParseComponentPath('/',
    $arUrlTemplates2, $arVariables);
$asset = Asset::getInstance();
// Вставляем кнопки
if ($page == 'taskCheck')
{
    $asset->addString('<script>BX.ready(function () { BX.forTask.createButton(); });</script>');
}

if ($page2 == 'taskCheck')
{
    $asset->addString('<script>BX.ready(function () { BX.forTask.createButton(); });</script>');
}

?>