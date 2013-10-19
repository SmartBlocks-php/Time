<?php
/**
 * Created by Antoine Jackson
 * User: Antoine Jackson
 * Date: 10/16/13
 * Time: 11:04 PM
 */

namespace Time;

class EventsController extends \Controller
{
    public function before_filter()
    {
        \User::restrict();
    }


    public function index()
    {
        $em = \Model::getEntityManager();
        $qb = $em->createQueryBuilder();

        $qb->select('e')->from('\Time\Event', 'e')->where('e.owner = :user')
            ->setParameter('user', \User::current_user());

        $results = $qb->getQuery()->getResult();

        $response = array();
        foreach ($results as $result)
        {
            $response[] = $result->toArray();
        }

        $this->return_json($response);
    }

    private function createOrUpdate($data)
    {
        if (isset($data["id"]))
            $event = Event::find($data["id"]);
        else
            $event = null;

        if (!is_object($event))
        {
            $event = new Event();
        }

        $event->setOwner(\User::current_user());

        $event->setName($data["name"]);
        unset($data["name"]);

        $event->setDescription($data["description"]);
        unset($data["description"]);
        $start = \DateTime::createFromFormat('Y-m-d\TH:i:s.uO', $data["start"]);
        $event->setStart($start);
        unset($data["start"]);
        $stop = \DateTime::createFromFormat('Y-m-d\TH:i:s.uO', $data["end"]);
        $event->setEnd($stop);
        unset($data["end"]);
        unset($data["owner"]);
        unset($data["id"]);

        $event_data = $data;
        $data_array = $event->getData();

        if (is_array($event_data))
        {
            foreach ($event_data as $key => $d)
            {
                $data_array[$key] = $d;
            }

        }

        foreach ($data_array as $key => $d)
        {
            if (!isset($event_data[$key])) {
                unset($data_array[$key]);
            }
        }
        $event->setData($data_array);
        $event->save();

        return $event->toArray();
    }

    public function create()
    {
        $data = $this->getRequestData();
        $this->return_json($this->createOrUpdate($data));
    }

    public function update($data = array())
    {

        $id = $data["id"];
        $data = $this->getRequestData();

        if (isset($data["id"]))
            $event = Event::find($data["id"]);
        else
            $event = null;
        if (is_object($event))
        {
            if ($event->getOwner() == \User::current_user())
            {
                $this->return_json($this->createOrUpdate($data));
            }
            else
            {
                $this->json_error("This event does not exist", 404);
            }
        }
        else
        {
            $this->json_error("This event does not exist", 404);
        }
    }


    public function destroy($data = array())
    {
        $event = Event::find($data["id"]);
        if (is_object($event))
        {
            if ($event->getOwner() == \User::current_user())
            {
                $event->delete();
                $this->json_message("Successfully deleted event");
            }
            else
            {
                $this->json_error("This event does not exist", 404);
            }
        }
        else
        {
            $this->json_error("This event does not exist", 404);
        }
    }

}