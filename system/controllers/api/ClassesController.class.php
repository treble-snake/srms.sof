<?php

namespace srms\sof\controllers\api;


class ClassesController extends ApiController
{
    const NEWS_COLLECTION_NAME = 'classes';

    public function listAction()
    {
        $query = [];
        return $this->listItems(self::NEWS_COLLECTION_NAME, true, $query);
    }
}
