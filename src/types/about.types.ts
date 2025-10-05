export interface AboutSection {
    id: string
    title: string
    content: string
    image: string
    imageAlt: string
    imagePosition: 'left' | 'right'
}

export interface AboutData {
    sections: AboutSection[]
}