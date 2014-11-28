<?php

namespace srms\sof\controllers\api;


class ClassesController extends ApiController
{
    const COLLECTION_NAME = 'classes';

    public function listAction()
    {
        $query = [];
        return $this->listItems(self::COLLECTION_NAME, true, $query);
    }
}
