<?php

namespace srms\sof\controllers\api;


class NewsController extends ApiController
{
    const NEWS_COLLECTION_NAME = 'news';
    const TAGS_COLLECTION_NAME = 'tags';

    public function listAction()
    {
        $query = [];
        if(!empty($this->requestParams['tag']))
            $query['tags'] = $this->requestParams['tag'];

        return $this->listItems(self::NEWS_COLLECTION_NAME, false, $query, ['date' => -1]);
    }

    public function tagsAction()
    {
        return $this->listItems(self::TAGS_COLLECTION_NAME);
    }
}
