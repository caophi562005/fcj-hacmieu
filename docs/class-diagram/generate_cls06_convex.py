import os
import sys

def generate():
    from plantuml import PlantUML
    server = PlantUML(url='http://www.plantuml.com/plantuml/svg/')

    plantuml_code = """
@startuml
skinparam classAttributeIconSize 0
left to right direction

class conversations {
    + _id: Id<conversations>
    + participantsKey: string
    + participants: string[]
    + lastMessage: LastMessage
    + lastMessageAt: number
}

class conversationMembers {
    + _id: Id<conversationMembers>
    + conversationId: Id<conversations>
    + userId: string
    + peerId: string
    + peerName: string
    + peerAvatar: string
    + lastMessageAt: number
    + lastMessagePreview: string
}

class messages {
    + _id: Id<messages>
    + conversationId: Id<conversations>
    + senderId: string
    + kind: string
    + body: string
}

class botConversations {
    + _id: Id<botConversations>
    + sessionId: string
    + threadId: string
    + status: string
    + createdAt: number
    + expiresAt: number
}

class botKnowledgeBase {
    + _id: Id<botKnowledgeBase>
    + title: string
    + category: string
    + storageId: Id<_storage>
    + status: string
    + createdAt: number
}

class ConvexFunctions <<functions>> {
    + getOrCreate(userId, peerId, ...): Id<conversations>
    + list(userId, paginationOpts): PaginationResult
    + send(conversationId, userId, kind, body): void
    + listMessages(conversationId, paginationOpts): PaginationResult
    + botCreate(sessionId): threadId
    + botSend(threadId, sessionId, prompt): string
}

conversations "1" *-- "0..*" conversationMembers : contains
conversations "1" *-- "0..*" messages : has
botConversations "1" ..> "1..*" botKnowledgeBase : RAG query
ConvexFunctions "1" ..> "1" conversations : manages
ConvexFunctions "1" ..> "1" messages : manages
ConvexFunctions "1" ..> "1" botConversations : manages
@enduml
"""

    dir_path = os.path.dirname(__file__)
    puml_file = os.path.join(dir_path, "temp_cls06.puml")
    output_file = os.path.join(dir_path, "cls06_convex.svg")
    
    with open(puml_file, "w", encoding="utf-8") as f:
        f.write(plantuml_code)

    print("Generating cls06_convex...")
    try:
        server.processes_file(puml_file, outfile=output_file)
        print(f"Success! Generated: {output_file}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
    finally:
        if os.path.exists(puml_file):
            os.remove(puml_file)

if __name__ == "__main__":
    generate()
