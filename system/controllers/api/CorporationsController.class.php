<?php
namespace srms\sof\controllers\api;


class CorporationsController extends ApiController
{
    const COLLECTION_NAME = 'corporations';

    public function listAction()
    {
        return $this->listItems(self::COLLECTION_NAME, true, []);
    }
} 