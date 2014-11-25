<?php

namespace srms\sof\controllers\api;


use srms\sof\controllers\AppController;
use srms\sof\controllers\DBController;

class NewsController
{
    const COLLECTION_NAME = 'news';

    public function allAction()
    {
        $cursor = DBController::db()->news->find();
        return json_encode(iterator_to_array($cursor, false));
    }

    public function tagsAction()
    {
        $cursor = DBController::db()->tags->find();
        return json_encode(iterator_to_array($cursor, false));
    }

    /**
     * TODO move to converter controller
     */
    public function addAction()
    {
        return;
        $json = '{
    "data": [
        {
            "title": "Описание корпораций",
            "text": "Запилено описание корпораций. Можно посмотреть, наведя мышь на соответствующий сектор \"пирога\" на странице корпораций.",
            "date": "2014-11-21 18:10:00",
            "tags": ["corporation", "site"]
        },
        {
            "title": "У новостей появились теги",
            "text": "По ним даже можно щелкать. И новости стали главной страницей по умолчанию.",
            "date": "2014-11-21 18:05:00",
            "tags": ["site"]
        },
        {
            "title": "У нас появились новости!",
            "text": "Собственно сабж.",
            "date": "2014-11-20 11:40:00"
        }
    ]
    }';

        $obj = json_decode($json, false);

        foreach ($obj->data as $news) {
            $news->date = new \MongoDate(strtotime($news->date));
            AppController::printVariable(DBController::db()->news->insert($news));
            echo '<br/><br/>';
        }
    }
}
